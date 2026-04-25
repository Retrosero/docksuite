import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type { HrAttendanceRiskItem, HrDocumentRiskItem, HrLeavePendingItem, HrReportsData } from "../types";

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
  status?: string;
  employee_status?: string;
};

type AttendanceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  status?: string;
  attendance_date?: string;
};

type LeaveApplicationRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  docstatus?: number;
};

type OvertimeRow = {
  name?: string;
  employee?: string;
  status?: string;
  docstatus?: number;
};

type SalarySlipRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  net_pay?: number;
  posting_date?: string;
};

type DocumentRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  document_type?: string;
  status?: string;
  expiry_date?: string;
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

function todayMinusDays(days: number) {
  const base = new Date();
  base.setDate(base.getDate() - days);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchEmployees(): Promise<EmployeeRow[]> {
  const attempts: string[][] = [
    ["name", "employee_name", "status", "employee_status"],
    ["name", "employee_name", "status"],
    ["name", "employee_name"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<EmployeeRow>("Employee", {
        fields,
        orderBy: "modified desc",
        limit: 1000
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_status") || isFieldNotPermittedInQuery(error, "status")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchAttendanceRisks(): Promise<AttendanceRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "status", "attendance_date"],
    ["name", "employee", "status", "attendance_date"]
  ];

  const fromDate = todayMinusDays(30);
  const filters = [
    ["attendance_date", ">=", fromDate],
    ["status", "in", ["Absent", "Half Day"]]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<AttendanceRow>("Attendance", {
        fields,
        filters,
        orderBy: "attendance_date desc",
        limit: 200
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchPendingLeaves(): Promise<LeaveApplicationRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "leave_type", "from_date", "to_date", "status", "docstatus"],
    ["name", "employee", "leave_type", "from_date", "to_date", "status", "docstatus"],
    ["name", "employee", "from_date", "to_date", "status", "docstatus"]
  ];

  const filters = [["status", "in", ["Open", "Pending Approval"]]];

  for (const fields of attempts) {
    try {
      return await requestResourceList<LeaveApplicationRow>("Leave Application", {
        fields,
        filters,
        orderBy: "modified desc",
        limit: 200
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "leave_type")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchPendingOvertime(): Promise<OvertimeRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "status", "docstatus"],
    ["name", "status", "docstatus"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<OvertimeRow>("Overtime Request", {
        fields,
        filters: [["status", "in", ["Open", "Pending Approval"]]],
        orderBy: "modified desc",
        limit: 300
      });
    } catch {
      continue;
    }
  }

  return [];
}

async function fetchSalarySlips(): Promise<SalarySlipRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "net_pay", "posting_date"],
    ["name", "employee", "net_pay", "posting_date"]
  ];

  const fromDate = todayMinusDays(60);
  const filters = [["posting_date", ">=", fromDate]];

  for (const fields of attempts) {
    try {
      return await requestResourceList<SalarySlipRow>("Salary Slip", {
        fields,
        filters,
        orderBy: "posting_date desc",
        limit: 500
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchDocumentRisks(): Promise<DocumentRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "document_type", "status", "expiry_date"],
    ["name", "employee", "document_type", "status", "expiry_date"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<DocumentRow>("Employee Document Record", {
        fields,
        orderBy: "modified desc",
        limit: 2000
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name")) {
        continue;
      }
    }
  }

  return [];
}

function isDocumentRiskStatus(value: string | undefined) {
  const key = normalize(value);
  return key === "expired" || key === "expiring soon";
}

function isActiveEmployee(row: EmployeeRow) {
  const key = normalize(row.status ?? row.employee_status);
  if (!key) {
    return true;
  }
  return key === "active";
}

export async function fetchHrReportsData(): Promise<HrReportsData> {
  const [
    canReadEmployee,
    canReadAttendance,
    canReadLeaveApplication,
    canReadOvertime,
    canReadSalarySlip,
    canReadDocumentRecord
  ] = await Promise.all([
    canReadDoctype("Employee"),
    canReadDoctype("Attendance"),
    canReadDoctype("Leave Application"),
    canReadDoctype("Overtime Request"),
    canReadDoctype("Salary Slip"),
    canReadDoctype("Employee Document Record")
  ]);

  const [employeeRows, attendanceRows, leaveRows, overtimeRows, salaryRows, documentRows] = await Promise.all([
    canReadEmployee ? fetchEmployees() : Promise.resolve([]),
    canReadAttendance ? fetchAttendanceRisks() : Promise.resolve([]),
    canReadLeaveApplication ? fetchPendingLeaves() : Promise.resolve([]),
    canReadOvertime ? fetchPendingOvertime() : Promise.resolve([]),
    canReadSalarySlip ? fetchSalarySlips() : Promise.resolve([]),
    canReadDocumentRecord ? fetchDocumentRisks() : Promise.resolve([])
  ]);

  const attendanceRisks: HrAttendanceRiskItem[] = attendanceRows.map((row) => ({
    id: row.name ?? "-",
    employeeId: row.employee ?? "-",
    employeeName: row.employee_name?.trim() || row.employee || "-",
    status: row.status?.trim() || "Belirsiz",
    attendanceDate: row.attendance_date ?? null
  }));

  const pendingLeaves: HrLeavePendingItem[] = leaveRows.map((row) => ({
    id: row.name ?? "-",
    employeeId: row.employee ?? "-",
    employeeName: row.employee_name?.trim() || row.employee || "-",
    leaveType: row.leave_type?.trim() || "Izin",
    fromDate: row.from_date ?? null,
    toDate: row.to_date ?? null,
    status: row.status?.trim() || "Belirsiz"
  }));

  const documentRisks: HrDocumentRiskItem[] = documentRows
    .filter((row) => isDocumentRiskStatus(row.status))
    .map((row) => ({
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      documentType: row.document_type?.trim() || "Belge",
      status: normalize(row.status) === "expired" ? "Suresi Doldu" : "Yaklasiyor",
      expiryDate: row.expiry_date ?? null
    }));

  const salaryNetPayTotal = salaryRows.reduce((total, row) => total + (typeof row.net_pay === "number" ? row.net_pay : 0), 0);

  return {
    attendanceRisks: attendanceRisks.slice(0, 30),
    pendingLeaves: pendingLeaves.slice(0, 30),
    documentRisks: documentRisks.slice(0, 30),
    summary: {
      totalEmployeeCount: employeeRows.length,
      activeEmployeeCount: employeeRows.filter((row) => isActiveEmployee(row)).length,
      pendingLeaveCount: leaveRows.length,
      pendingOvertimeCount: overtimeRows.length,
      salarySlipCount: salaryRows.length,
      salaryNetPayTotal,
      attendanceRiskCount: attendanceRows.length,
      documentRiskCount: documentRisks.length
    }
  };
}
