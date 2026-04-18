import { requestErpJson } from "../../../lib/erpApi";
import type {
  BenefitItem,
  LeaveHistory,
  LeaveHistoryItem,
  LeaveHistorySummary,
  OvertimeHistory,
  OvertimeHistoryItem,
  OvertimeHistorySummary,
  SalaryInfo,
  WorkHistory,
  WorkHistoryItem,
  WorkHistorySummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeDocResponse<T> = {
  data?: T;
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type SalaryStructureAssignmentRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  salary_structure?: string;
  base?: number;
  currency?: string;
  effective_from?: string;
};

type AdditionalSalaryRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  salary_component?: string;
  amount?: number;
  docstatus?: number;
};

type SalaryComponentRow = {
  name?: string;
  type?: string;
};

type AttendanceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  attendance_date?: string;
  in_time?: string;
  out_time?: string;
  shift?: string;
  status?: string;
};

type LeaveApplicationRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  total_leave_days?: number;
  status?: string;
  workflow_state?: string;
};

type LeaveAllocationRow = {
  name?: string;
  employee?: string;
  leave_type?: string;
  total_leaves_allocated?: number;
  leaves_used?: number;
};

type OvertimeRequestRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  date?: string;
  hours?: number;
  reason?: string;
  status?: string;
  workflow_state?: string;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  shipyard_monthly_base_salary?: number;
  salary_currency?: string;
  company?: string;
  status?: string;
};

export type SalaryEmployeeOption = {
  id: string;
  name: string;
};

const REQUEST_TIMEOUT_MS = 9000;

// Helper functions
async function requestJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  return requestErpJson<T>(path, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });
}

async function requestResourceList<T>(doctype: string, options: {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
}): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 200));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const encodedDoctype = encodeURIComponent(doctype);
  const payload = await requestJson<FrappeListResponse<T>>(`/resource/${encodedDoctype}`, params);
  return payload.data ?? [];
}

function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBenefitType(value: string | null | undefined): "allowance" | "deduction" {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("deduction")) return "deduction";
  return "allowance";
}

async function fetchSalaryComponentTypeMap(componentNames: string[]): Promise<Map<string, "allowance" | "deduction">> {
  const uniqueNames = Array.from(new Set(componentNames.filter((name) => typeof name === "string" && name.length > 0)));
  if (uniqueNames.length === 0) {
    return new Map();
  }

  const rows = await requestResourceList<SalaryComponentRow>("Salary Component", {
    fields: ["name", "type"],
    filters: [["name", "in", uniqueNames]],
    limit: Math.max(100, uniqueNames.length)
  });

  const byName = new Map<string, "allowance" | "deduction">();
  for (const row of rows) {
    const key = row.name ?? "";
    if (!key) continue;
    byName.set(key, normalizeBenefitType(row.type));
  }
  return byName;
}

function getPeriodDates(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function calculateHoursWorked(inTime: string | null | undefined, outTime: string | null | undefined): number {
  if (!inTime || !outTime) return 0;

  const inDate = new Date(inTime);
  const outDate = new Date(outTime);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0;

  const diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs < 0) return 0;

  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function toLeaveStatusMeta(status: string | null | undefined, workflowState: string | null | undefined) {
  const normalized = (workflowState ?? status ?? "").trim().toLowerCase();

  if (normalized === "approved") {
    return { status: "approved", statusLabel: "Onaylandi" };
  }
  if (normalized === "rejected") {
    return { status: "rejected", statusLabel: "Reddedildi" };
  }
  if (normalized === "cancelled") {
    return { status: "cancelled", statusLabel: "Iptal" };
  }
  if (normalized === "open" || normalized === "pending") {
    return { status: "open", statusLabel: "Onay bekliyor" };
  }
  return { status: "other", statusLabel: "Belirsiz" };
}

function toOvertimeStatusMeta(status: string | null | undefined, workflowState: string | null | undefined) {
  return toLeaveStatusMeta(status, workflowState);
}

// Salary Structure Assignment API
export async function fetchSalaryInfo(employeeId: string): Promise<SalaryInfo | null> {
  try {
    const rows = await requestResourceList<SalaryStructureAssignmentRow>("Salary Structure Assignment", {
      fields: ["name", "employee", "employee_name", "salary_structure", "base", "currency", "effective_from"],
      filters: [["employee", "=", employeeId]],
      orderBy: "effective_from desc",
      limit: 1
    });

    const row = rows[0];
    if (row) {
      return {
        name: row.name ?? "",
        employee: row.employee ?? "",
        employee_name: row.employee_name ?? "",
        baseSalary: row.base ?? 0,
        currency: row.currency ?? "TRY",
        payGrade: row.salary_structure ?? "-",
        effectiveFrom: row.effective_from ?? null
      };
    }
  } catch {
    // Salary Structure Assignment kaynağı her tenant/rolde açık olmayabilir.
  }

  // ERPNext Employee custom-field fallback: shipyard_monthly_base_salary
  try {
    const employeeRows = await requestResourceList<EmployeeRow>("Employee", {
      fields: ["name", "employee_name", "shipyard_monthly_base_salary", "salary_currency"],
      filters: [["name", "=", employeeId]],
      limit: 1
    });

    const employeeRow = employeeRows[0];
    const manualAmount = Number(employeeRow?.shipyard_monthly_base_salary ?? 0);
    if (!employeeRow || !Number.isFinite(manualAmount) || manualAmount <= 0) {
      return null;
    }

    return {
      name: `EMP-${employeeId}`,
      employee: employeeId,
      employee_name: employeeRow.employee_name ?? employeeId,
      baseSalary: manualAmount,
      currency: employeeRow.salary_currency ?? "TRY",
      payGrade: "Manuel Tanim",
      effectiveFrom: null
    };
  } catch {
    return null;
  }
}

// Additional Salary (Benefits) API
export async function fetchBenefits(employeeId: string): Promise<BenefitItem[]> {
  const rows = await requestResourceList<AdditionalSalaryRow>("Additional Salary", {
    fields: ["name", "employee", "salary_component", "amount", "docstatus"],
    filters: [["employee", "=", employeeId]],
    orderBy: "name desc",
    limit: 100
  });

  let componentTypeMap = new Map<string, "allowance" | "deduction">();
  try {
    componentTypeMap = await fetchSalaryComponentTypeMap(rows.map((row) => row.salary_component ?? ""));
  } catch {
    // Salary Component meta veya yetki farklarÄ±nda varsayÄ±lan tip allowance olur.
  }

  return rows
    .filter(row => row.docstatus === 1)
    .map(row => ({
      id: row.name ?? "",
      name: row.name ?? "",
      benefitName: row.salary_component ?? "",
      type: componentTypeMap.get(row.salary_component ?? "") ?? "allowance",
      amount: row.amount ?? 0,
      isTaxable: false
    }));
}

// Work History API
export async function fetchWorkHistory(employeeId: string, year: number, month: number): Promise<WorkHistory | null> {
  const { start, end } = getPeriodDates(year, month);

  const rows = await requestResourceList<AttendanceRow>("Attendance", {
    fields: ["name", "employee", "attendance_date", "in_time", "out_time", "shift", "status"],
    filters: [
      ["employee", "=", employeeId],
      ["attendance_date", ">=", start],
      ["attendance_date", "<=", end]
    ],
    orderBy: "attendance_date asc",
    limit: 100
  });

  const items: WorkHistoryItem[] = rows.map(row => ({
    id: row.name ?? "",
    date: row.attendance_date ?? "",
    checkin: row.in_time ?? "-",
    checkout: row.out_time ?? "-",
    hoursWorked: calculateHoursWorked(row.in_time, row.out_time),
    shiftType: row.shift ?? "-",
    status: row.status ?? "-"
  }));

  const totalDays = items.length;
  const presentDays = items.filter(i => i.status.toLowerCase() === "present").length;
  const absentDays = items.filter(i => i.status.toLowerCase() === "absent").length;
  const totalHoursWorked = items.reduce((sum, i) => sum + i.hoursWorked, 0);
  const avgHoursPerDay = totalDays > 0 ? Math.round((totalHoursWorked / totalDays) * 100) / 100 : 0;

  // Calculate regular vs overtime hours (assuming 8 hours is standard)
  const regularHours = Math.min(totalHoursWorked, totalDays * 8);
  const overtimeHours = Math.max(0, totalHoursWorked - regularHours);

  const summary: WorkHistorySummary = {
    totalDays,
    presentDays,
    absentDays,
    totalHoursWorked,
    regularHours,
    overtimeHours,
    avgHoursPerDay
  };

  return {
    employeeId,
    period: `${year}-${String(month).padStart(2, "0")}`,
    items,
    summary
  };
}

// Leave History API
export async function fetchLeaveHistory(employeeId: string): Promise<LeaveHistory> {
  const [applicationRows, allocationRows] = await Promise.all([
    requestResourceList<LeaveApplicationRow>("Leave Application", {
      fields: ["name", "employee", "leave_type", "from_date", "to_date", "total_leave_days", "status", "workflow_state"],
      filters: [["employee", "=", employeeId]],
      orderBy: "from_date desc",
      limit: 50
    }),
    requestResourceList<LeaveAllocationRow>("Leave Allocation", {
      fields: ["name", "employee", "leave_type", "total_leaves_allocated", "leaves_used"],
      filters: [["employee", "=", employeeId]],
      orderBy: "leave_type asc",
      limit: 50
    })
  ]);

  const items: LeaveHistoryItem[] = applicationRows.map(row => {
    const statusMeta = toLeaveStatusMeta(row.status, row.workflow_state);
    return {
      id: row.name ?? "",
      leaveType: row.leave_type ?? "-",
      fromDate: row.from_date ?? "",
      toDate: row.to_date ?? "",
      totalDays: row.total_leave_days ?? 0,
      status: statusMeta.status,
      statusLabel: statusMeta.statusLabel
    };
  });

  const approvedDays = items.filter(i => i.status === "approved").reduce((sum, i) => sum + i.totalDays, 0);
  const pendingDays = items.filter(i => i.status === "open").reduce((sum, i) => sum + i.totalDays, 0);
  const rejectedDays = items.filter(i => i.status === "rejected" || i.status === "cancelled").reduce((sum, i) => sum + i.totalDays, 0);

  const summary: LeaveHistorySummary = {
    totalApplications: items.length,
    approvedDays,
    pendingDays,
    rejectedDays
  };

  return {
    employeeId,
    items,
    summary
  };
}

// Overtime History API
export async function fetchOvertimeHistory(employeeId: string): Promise<OvertimeHistory> {
  const rows = await requestResourceList<OvertimeRequestRow>("Overtime Request", {
    fields: ["name", "employee", "date", "hours", "reason", "status", "workflow_state"],
    filters: [["employee", "=", employeeId]],
    orderBy: "date desc",
    limit: 50
  });

  const items: OvertimeHistoryItem[] = rows.map(row => {
    const statusMeta = toOvertimeStatusMeta(row.status, row.workflow_state);
    return {
      id: row.name ?? "",
      date: row.date ?? "",
      hours: row.hours ?? 0,
      reason: row.reason ?? "",
      status: statusMeta.status,
      statusLabel: statusMeta.statusLabel
    };
  });

  const approvedHours = items.filter(i => i.status === "approved").reduce((sum, i) => sum + i.hours, 0);
  const pendingHours = items.filter(i => i.status === "open").reduce((sum, i) => sum + i.hours, 0);
  const rejectedHours = items.filter(i => i.status === "rejected" || i.status === "cancelled").reduce((sum, i) => sum + i.hours, 0);

  const summary: OvertimeHistorySummary = {
    totalHours: items.reduce((sum, i) => sum + i.hours, 0),
    approvedHours,
    pendingHours,
    rejectedHours,
    totalPay: 0 // Will be calculated based on hourly rate
  };

  return {
    employeeId,
    items,
    summary
  };
}

// Create/Update Salary Record (Salary Structure Assignment)
export async function createSalaryStructureAssignment(
  employeeId: string,
  salaryStructure: string,
  base: number,
  currency: string = "TRY",
  effectiveFrom: string
): Promise<string> {
  const response = await requestErpJson<FrappeDocResponse<{ name?: string }>>(
    "/resource/Salary Structure Assignment",
    undefined,
    {
      method: "POST",
      body: {
        doctype: "Salary Structure Assignment",
        employee: employeeId,
        salary_structure: salaryStructure,
        base: base,
        currency: currency,
        effective_from: effectiveFrom
      }
    }
  );

  return response.data?.name ?? "";
}

// Create Additional Salary (Benefit)
export async function createAdditionalSalary(
  employeeId: string,
  salaryComponent: string,
  amount: number,
  _type: "allowance" | "deduction",
  _isTaxable: boolean = false
): Promise<string> {
  const employeeRows = await requestResourceList<EmployeeRow>("Employee", {
    fields: ["name", "company"],
    filters: [["name", "=", employeeId]],
    limit: 1
  });
  const employeeCompany = employeeRows[0]?.company?.trim() ?? "";

  const createPayload: {
    doctype: string;
    employee: string;
    salary_component: string;
    amount: number;
    payroll_date: string;
    company?: string;
  } = {
    doctype: "Additional Salary",
    employee: employeeId,
    salary_component: salaryComponent,
    amount: amount,
    payroll_date: formatDateIso(new Date())
  };

  if (employeeCompany.length > 0) {
    createPayload.company = employeeCompany;
  }

  const response = await requestErpJson<FrappeDocResponse<{ name?: string }>>(
    "/resource/Additional Salary",
    undefined,
    {
      method: "POST",
      body: createPayload
    }
  );

  return response.data?.name ?? "";
}

// Get Employee Name
export async function getEmployeeName(employeeId: string): Promise<string> {
  const rows = await requestResourceList<EmployeeRow>("Employee", {
    fields: ["name", "employee_name"],
    filters: [["name", "=", employeeId]],
    limit: 1
  });

  return rows[0]?.employee_name ?? rows[0]?.name ?? employeeId;
}

export async function fetchActiveEmployeeOptions(): Promise<SalaryEmployeeOption[]> {
  const rows = await requestResourceList<EmployeeRow>("Employee", {
    fields: ["name", "employee_name", "status"],
    filters: [["status", "!=", "Left"]],
    orderBy: "employee_name asc",
    limit: 300
  });

  return rows.map((row) => ({
    id: row.name ?? "",
    name: row.employee_name ?? row.name ?? ""
  })).filter((row) => row.id.length > 0);
}

export async function updateEmployeeSalary(
  employeeId: string,
  baseSalary: number,
  currency: string = "TRY"
): Promise<SalaryInfo> {
  await requestErpJson<FrappeDocResponse<{ name?: string }>>(
    `/resource/Employee/${encodeURIComponent(employeeId)}`,
    undefined,
    {
      method: "PUT",
      body: {
        shipyard_monthly_base_salary: baseSalary,
        salary_currency: currency
      },
      timeoutMs: REQUEST_TIMEOUT_MS
    }
  );

  const salaryInfo = await fetchSalaryInfo(employeeId);
  if (!salaryInfo) {
    throw new Error("Maaş kaydi guncellendi ancak yeni veri okunamadi.");
  }

  return salaryInfo;
}

// Get payroll periods for current year
export function getPayrollPeriods(): Array<{ year: number; month: number; label: string }> {
  const periods = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    periods.push({
      year,
      month,
      label: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(date)
    });
  }

  return periods;
}
