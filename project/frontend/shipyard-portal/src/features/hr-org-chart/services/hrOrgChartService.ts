import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type { HrOrgData, HrOrgDepartmentSummaryItem, HrOrgEmployeeNode, HrOrgManagerNode } from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  department?: string;
  designation?: string;
  reports_to?: string;
  status?: string;
  employee_status?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 300));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const payload = await requestErpJson<FrappeListResponse<T>>(`/resource/${encodeURIComponent(doctype)}`, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });

  return payload.data ?? [];
}

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

function isActiveEmployee(row: EmployeeRow) {
  const key = normalize(row.status ?? row.employee_status);
  if (!key) {
    return true;
  }
  return key === "active";
}

async function fetchEmployees(): Promise<EmployeeRow[]> {
  const attempts: string[][] = [
    ["name", "employee_name", "department", "designation", "reports_to", "status", "employee_status"],
    ["name", "employee_name", "department", "designation", "reports_to", "status"],
    ["name", "employee_name", "department", "designation", "reports_to"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<EmployeeRow>("Employee", {
        fields,
        orderBy: "modified desc",
        limit: 2000
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_status") || isFieldNotPermittedInQuery(error, "designation")) {
        continue;
      }
    }
  }

  return [];
}

export async function fetchHrOrgData(): Promise<HrOrgData> {
  const canReadEmployee = await canReadDoctype("Employee");
  const employeeRows = canReadEmployee ? await fetchEmployees() : [];
  const activeRows = employeeRows.filter((row) => isActiveEmployee(row));

  const nameById = new Map(activeRows.map((row) => [row.name ?? "-", row.employee_name?.trim() || row.name || "-"] as const));

  const directReportsByManager = new Map<string, HrOrgEmployeeNode[]>();
  const employeeNodes: HrOrgEmployeeNode[] = activeRows.map((row) => {
    const employeeId = row.name ?? "-";
    const reportsTo = row.reports_to?.trim() || null;
    const node: HrOrgEmployeeNode = {
      employeeId,
      employeeName: row.employee_name?.trim() || employeeId,
      designation: row.designation?.trim() || "-",
      department: row.department?.trim() || "-",
      reportsTo,
      reportsToName: reportsTo ? nameById.get(reportsTo) ?? reportsTo : null,
      directReportCount: 0
    };

    if (reportsTo) {
      const current = directReportsByManager.get(reportsTo) ?? [];
      current.push(node);
      directReportsByManager.set(reportsTo, current);
    }

    return node;
  });

  const nodesById = new Map(employeeNodes.map((node) => [node.employeeId, node] as const));
  for (const [managerId, reports] of directReportsByManager.entries()) {
    const manager = nodesById.get(managerId);
    if (manager) {
      manager.directReportCount = reports.length;
    }
  }

  const managers: HrOrgManagerNode[] = [...directReportsByManager.entries()]
    .map(([managerId, reports]) => {
      const manager = nodesById.get(managerId);
      return {
        managerId,
        managerName: manager?.employeeName || managerId,
        designation: manager?.designation || "-",
        department: manager?.department || "-",
        directReports: reports.sort((left, right) => left.employeeName.localeCompare(right.employeeName, "tr"))
      };
    })
    .sort((left, right) => right.directReports.length - left.directReports.length || left.managerName.localeCompare(right.managerName, "tr"))
    .slice(0, 25);

  const unassignedEmployees = employeeNodes
    .filter((node) => !node.reportsTo)
    .sort((left, right) => left.employeeName.localeCompare(right.employeeName, "tr"))
    .slice(0, 40);

  const departmentMap = new Map<string, number>();
  for (const node of employeeNodes) {
    const key = node.department !== "-" ? node.department : "Belirtilmemis";
    departmentMap.set(key, (departmentMap.get(key) ?? 0) + 1);
  }

  const departmentSummary: HrOrgDepartmentSummaryItem[] = [...departmentMap.entries()]
    .map(([key, count]) => ({ key, label: key, employeeCount: count }))
    .sort((left, right) => right.employeeCount - left.employeeCount)
    .slice(0, 20);

  return {
    managers,
    unassignedEmployees,
    departmentSummary,
    summary: {
      totalEmployeeCount: employeeNodes.length,
      managerCount: directReportsByManager.size,
      topManagerCount: employeeNodes.filter((node) => node.directReportCount >= 5).length,
      withManagerCount: employeeNodes.filter((node) => node.reportsTo).length,
      withoutManagerCount: employeeNodes.filter((node) => !node.reportsTo).length
    }
  };
}
