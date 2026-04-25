import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrOffboardingData,
  HrOffboardingItem,
  HrOffboardingStatusSummaryItem,
  HrOffboardingSummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type SeparationRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  status?: string;
  boarding_status?: string;
  resignation_letter_date?: string;
  relieving_date?: string;
  department?: string;
  designation?: string;
  modified?: string;
};

type ExitInterviewRow = {
  employee?: string;
};

type FullFinalRow = {
  employee?: string;
};

type ZimmetRow = {
  employee?: string;
  return_status?: string;
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

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

async function fetchSeparationRows(): Promise<SeparationRow[]> {
  const attempts: Array<{ fields: string[]; orderBy: string }> = [
    {
      fields: [
        "name",
        "employee",
        "employee_name",
        "status",
        "boarding_status",
        "resignation_letter_date",
        "relieving_date",
        "department",
        "designation",
        "modified"
      ],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "employee", "employee_name", "status", "resignation_letter_date", "relieving_date", "modified"],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "employee", "status", "modified"],
      orderBy: "modified desc"
    }
  ];

  for (const attempt of attempts) {
    try {
      return await requestResourceList<SeparationRow>("Employee Separation", {
        fields: attempt.fields,
        orderBy: attempt.orderBy,
        limit: 300
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "boarding_status") ||
        isFieldNotPermittedInQuery(error, "department") ||
        isFieldNotPermittedInQuery(error, "resignation_letter_date")
      ) {
        continue;
      }
      continue;
    }
  }

  return [];
}

function normalizeStatus(rawValue: string | undefined) {
  const normalized = (rawValue ?? "").trim().toLowerCase();
  if (normalized.includes("complete") || normalized.includes("tamam")) {
    return { key: "completed", label: "Tamamlandi", tone: "positive" as const };
  }
  if (
    normalized.includes("progress") ||
    normalized.includes("active") ||
    normalized.includes("process") ||
    normalized.includes("acik")
  ) {
    return { key: "in_progress", label: "Devam Ediyor", tone: "warning" as const };
  }
  if (normalized.includes("cancel") || normalized.includes("iptal")) {
    return { key: "cancelled", label: "Iptal", tone: "negative" as const };
  }
  return { key: "pending", label: "Beklemede", tone: "neutral" as const };
}

function isZimmetOpen(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return normalized !== "tam iade";
}

function buildStatusSummary(items: HrOffboardingItem[]): HrOffboardingStatusSummaryItem[] {
  const map = new Map<string, HrOffboardingStatusSummaryItem>();
  for (const item of items) {
    const normalized = normalizeStatus(item.status);
    const current = map.get(normalized.key);
    if (current) {
      current.count += 1;
      continue;
    }
    map.set(normalized.key, {
      key: normalized.key,
      label: normalized.label,
      count: 1
    });
  }

  const order = ["pending", "in_progress", "completed", "cancelled"];
  return [...map.values()].sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key));
}

function buildSummary(items: HrOffboardingItem[]): HrOffboardingSummary {
  const completedCount = items.filter((item) => normalizeStatus(item.status).key === "completed").length;
  const inProgressCount = items.filter((item) => normalizeStatus(item.status).key === "in_progress").length;
  const pendingCount = items.filter((item) => normalizeStatus(item.status).key === "pending").length;
  const openAssetRiskCount = items.filter((item) => item.openZimmetCount > 0).length;
  const missingInterviewCount = items.filter((item) => item.interviewCount === 0).length;
  const missingFinalSettlementCount = items.filter((item) => item.finalSettlementCount === 0).length;

  return {
    totalRecords: items.length,
    completedCount,
    inProgressCount,
    pendingCount,
    openAssetRiskCount,
    missingInterviewCount,
    missingFinalSettlementCount
  };
}

export async function fetchHrOffboardingData(): Promise<HrOffboardingData> {
  const canReadSeparation = await canReadDoctype("Employee Separation");
  if (!canReadSeparation) {
    return {
      items: [],
      statusSummary: [],
      summary: {
        totalRecords: 0,
        completedCount: 0,
        inProgressCount: 0,
        pendingCount: 0,
        openAssetRiskCount: 0,
        missingInterviewCount: 0,
        missingFinalSettlementCount: 0
      }
    };
  }

  const separationRows = await fetchSeparationRows();
  const employeeIds = [...new Set(separationRows.map((row) => row.employee?.trim() ?? "").filter((value) => value.length > 0))];

  let interviewRows: ExitInterviewRow[] = [];
  const canReadInterview = await canReadDoctype("Exit Interview");
  if (canReadInterview && employeeIds.length > 0) {
    try {
      interviewRows = await requestResourceList<ExitInterviewRow>("Exit Interview", {
        fields: ["employee"],
        filters: [["employee", "in", employeeIds]],
        limit: 2000
      });
    } catch {
      interviewRows = [];
    }
  }

  let finalRows: FullFinalRow[] = [];
  const canReadFinal = await canReadDoctype("Full and Final Statement");
  if (canReadFinal && employeeIds.length > 0) {
    try {
      finalRows = await requestResourceList<FullFinalRow>("Full and Final Statement", {
        fields: ["employee"],
        filters: [["employee", "in", employeeIds]],
        limit: 2000
      });
    } catch {
      finalRows = [];
    }
  }

  let zimmetRows: ZimmetRow[] = [];
  const canReadZimmet = await canReadDoctype("Zimmet");
  if (canReadZimmet && employeeIds.length > 0) {
    try {
      zimmetRows = await requestResourceList<ZimmetRow>("Zimmet", {
        fields: ["employee", "return_status"],
        filters: [["employee", "in", employeeIds]],
        limit: 3000
      });
    } catch {
      zimmetRows = [];
    }
  }

  const interviewCountByEmployee = new Map<string, number>();
  for (const row of interviewRows) {
    const employeeId = row.employee?.trim() ?? "";
    if (!employeeId) {
      continue;
    }
    interviewCountByEmployee.set(employeeId, (interviewCountByEmployee.get(employeeId) ?? 0) + 1);
  }

  const finalCountByEmployee = new Map<string, number>();
  for (const row of finalRows) {
    const employeeId = row.employee?.trim() ?? "";
    if (!employeeId) {
      continue;
    }
    finalCountByEmployee.set(employeeId, (finalCountByEmployee.get(employeeId) ?? 0) + 1);
  }

  const openZimmetCountByEmployee = new Map<string, number>();
  for (const row of zimmetRows) {
    const employeeId = row.employee?.trim() ?? "";
    if (!employeeId || !isZimmetOpen(row.return_status)) {
      continue;
    }
    openZimmetCountByEmployee.set(employeeId, (openZimmetCountByEmployee.get(employeeId) ?? 0) + 1);
  }

  const items: HrOffboardingItem[] = separationRows.map((row) => {
    const employeeId = row.employee?.trim() || "-";
    const statusSource = row.status ?? row.boarding_status ?? "";
    const normalized = normalizeStatus(statusSource);
    const interviewCount = interviewCountByEmployee.get(employeeId) ?? 0;
    const finalSettlementCount = finalCountByEmployee.get(employeeId) ?? 0;
    const openZimmetCount = openZimmetCountByEmployee.get(employeeId) ?? 0;
    const riskNotes: string[] = [];

    if (!row.relieving_date) {
      riskNotes.push("Ayrilis tarihi eksik");
    }
    if (openZimmetCount > 0) {
      riskNotes.push(`${openZimmetCount} acik zimmet kaydi var`);
    }
    if (interviewCount === 0) {
      riskNotes.push("Exit Interview kaydi yok");
    }
    if (finalSettlementCount === 0) {
      riskNotes.push("Final hesaplasma kaydi yok");
    }

    return {
      id: row.name ?? "-",
      employeeId,
      employeeName: row.employee_name?.trim() || employeeId,
      status: normalized.label,
      statusTone: normalized.tone,
      separationDate: row.resignation_letter_date ?? null,
      relievingDate: row.relieving_date ?? null,
      department: row.department?.trim() || "-",
      designation: row.designation?.trim() || "-",
      updatedAt: row.modified ?? null,
      interviewCount,
      finalSettlementCount,
      openZimmetCount,
      riskNotes
    };
  });

  return {
    items,
    statusSummary: buildStatusSummary(items),
    summary: buildSummary(items)
  };
}
