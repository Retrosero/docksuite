import { canReadDoctype, requestErpJson, uploadErpFile } from "../../../lib/erpApi";
import type {
  HrSelfServiceAttendanceSnapshot,
  HrSelfServiceData,
  HrSelfServiceDocumentFileRefOption,
  HrSelfServiceDocumentItem,
  HrSelfServiceDocumentRecordInput,
  HrSelfServiceExpenseItem,
  HrSelfServiceLeaveItem,
  HrSelfServiceSalaryItem,
  HrSelfServiceSummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeMethodResponse<T> = {
  message?: T;
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
  status?: string;
  employee_status?: string;
  date_of_joining?: string;
};

type AttendanceRow = {
  name?: string;
  attendance_date?: string;
  status?: string;
};

type LeaveApplicationRow = {
  name?: string;
  leave_type?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
};

type ExpenseClaimRow = {
  name?: string;
  expense_type?: string;
  posting_date?: string;
  status?: string;
  grand_total?: number;
  total_sanctioned_amount?: number;
  currency?: string;
};

type SalarySlipRow = {
  name?: string;
  posting_date?: string;
  net_pay?: number;
  currency?: string;
  status?: string;
};

type DocumentRecordRow = {
  name?: string;
  document_type?: string;
  file_ref?: string;
  file_name?: string;
  file_url?: string;
  is_private?: number;
  issue_date?: string;
  status?: string;
  expiry_date?: string;
};

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_CURRENCY = "TRY";

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

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 100));

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

async function getLoggedUserEmail() {
  try {
    const payload = await requestErpJson<FrappeMethodResponse<string>>("/method/frappe.auth.get_logged_user", undefined, {
      timeoutMs: REQUEST_TIMEOUT_MS
    });
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

async function getEmployeeByUser(userEmail: string): Promise<EmployeeRow | null> {
  const attempts: string[][] = [
    ["name", "employee_name", "department", "designation", "status", "employee_status", "date_of_joining"],
    ["name", "employee_name", "department", "designation", "status", "date_of_joining"],
    ["name", "employee_name", "department", "designation", "date_of_joining"]
  ];

  for (const fields of attempts) {
    try {
      const rows = await requestResourceList<EmployeeRow>("Employee", {
        fields,
        filters: [["user_id", "=", userEmail]],
        limit: 1
      });
      return rows[0] ?? null;
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_status")) {
        continue;
      }
    }
  }

  return null;
}

function mapAttendance(rows: AttendanceRow[]): HrSelfServiceAttendanceSnapshot {
  const sorted = [...rows].sort((left, right) => (right.attendance_date ?? "").localeCompare(left.attendance_date ?? ""));
  const latest = sorted[0] ?? null;
  const presentCount = rows.filter((row) => normalize(row.status) === "present").length;
  const absentCount = rows.filter((row) => normalize(row.status) === "absent").length;
  const leaveCount = rows.filter((row) => normalize(row.status) === "on leave").length;

  const latestStatusKey = normalize(latest?.status);
  let latestStatus = "Kayit Yok";
  if (latestStatusKey === "present") latestStatus = "Katildi";
  else if (latestStatusKey === "absent") latestStatus = "Gelmedi";
  else if (latestStatusKey === "half day") latestStatus = "Yarim Gun";
  else if (latestStatusKey === "on leave") latestStatus = "Izinli";

  return {
    latestDate: latest?.attendance_date ?? null,
    latestStatus,
    presentCountLast7Days: presentCount,
    absentCountLast7Days: absentCount,
    leaveCountLast7Days: leaveCount
  };
}

function mapLeaves(rows: LeaveApplicationRow[]): HrSelfServiceLeaveItem[] {
  return rows.map((row) => ({
    id: row.name ?? "-",
    leaveType: row.leave_type?.trim() || "Izin",
    fromDate: row.from_date ?? null,
    toDate: row.to_date ?? null,
    status: row.status?.trim() || "Belirsiz"
  }));
}

function mapExpenses(rows: ExpenseClaimRow[]): HrSelfServiceExpenseItem[] {
  return rows.map((row) => ({
    id: row.name ?? "-",
    claimType: row.expense_type?.trim() || "Masraf",
    postingDate: row.posting_date ?? null,
    status: row.status?.trim() || "Belirsiz",
    amount: typeof row.total_sanctioned_amount === "number" ? row.total_sanctioned_amount : typeof row.grand_total === "number" ? row.grand_total : 0,
    currency: row.currency?.trim() || DEFAULT_CURRENCY
  }));
}

function mapSalaries(rows: SalarySlipRow[]): HrSelfServiceSalaryItem[] {
  return rows.map((row) => ({
    id: row.name ?? "-",
    postingDate: row.posting_date ?? null,
    netPay: typeof row.net_pay === "number" ? row.net_pay : 0,
    currency: row.currency?.trim() || DEFAULT_CURRENCY,
    status: row.status?.trim() || "Belirsiz"
  }));
}

function mapDocumentRisks(rows: DocumentRecordRow[]): HrSelfServiceDocumentItem[] {
  return rows
    .filter((row) => {
      const statusKey = normalize(row.status);
      return statusKey === "expired" || statusKey === "expiring soon";
    })
    .map((row) => ({
      id: row.name ?? "-",
      documentType: row.document_type?.trim() || "Belge",
      fileRef: row.file_ref?.trim() || "",
      fileName: row.file_name?.trim() || row.file_ref?.trim() || row.name || "Belge",
      fileUrl: row.file_url?.trim() || "",
      visibility: row.is_private === 1 ? "private" : "public",
      status: normalize(row.status) === "expired" ? "Suresi Doldu" : "Yaklasiyor",
      issueDate: row.issue_date ?? null,
      expiryDate: row.expiry_date ?? null
    }));
}

function mapRecentDocuments(rows: DocumentRecordRow[]): HrSelfServiceDocumentItem[] {
  return rows.map((row) => ({
    id: row.name ?? "-",
    documentType: row.document_type?.trim() || "Belge",
    fileRef: row.file_ref?.trim() || "",
    fileName: row.file_name?.trim() || row.file_ref?.trim() || row.name || "Belge",
    fileUrl: row.file_url?.trim() || "",
    visibility: row.is_private === 1 ? "private" : "public",
    status: row.status?.trim() || "Belirsiz",
    issueDate: row.issue_date ?? null,
    expiryDate: row.expiry_date ?? null
  }));
}

function mapFileRefOptions(rows: DocumentRecordRow[]): HrSelfServiceDocumentFileRefOption[] {
  const options: HrSelfServiceDocumentFileRefOption[] = [];
  const seenRefs = new Set<string>();

  for (const row of rows) {
    const fileRef = row.file_ref?.trim() || "";
    const fileUrl = row.file_url?.trim() || "";
    if (!fileRef || !fileUrl || seenRefs.has(fileRef)) {
      continue;
    }
    seenRefs.add(fileRef);
    options.push({
      fileRef,
      fileName: row.file_name?.trim() || fileRef,
      fileUrl,
      visibility: row.is_private === 1 ? "private" : "public"
    });
  }

  return options;
}

async function fetchDocumentRows(employeeId: string): Promise<DocumentRecordRow[]> {
  const attempts: string[][] = [
    ["name", "document_type", "file_ref", "file_name", "file_url", "is_private", "issue_date", "status", "expiry_date"],
    ["name", "document_type", "file_ref", "file_name", "file_url", "issue_date", "status", "expiry_date"],
    ["name", "document_type", "file_ref", "status", "expiry_date"],
    ["name", "document_type", "status", "expiry_date"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<DocumentRecordRow>("Employee Document Record", {
        fields,
        filters: [["employee", "=", employeeId]],
        orderBy: "modified desc",
        limit: 40
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "file_name") ||
        isFieldNotPermittedInQuery(error, "file_url") ||
        isFieldNotPermittedInQuery(error, "is_private") ||
        isFieldNotPermittedInQuery(error, "issue_date") ||
        isFieldNotPermittedInQuery(error, "file_ref")
      ) {
        continue;
      }
      throw error;
    }
  }

  return [];
}

function buildSummary(
  leaves: HrSelfServiceLeaveItem[],
  expenses: HrSelfServiceExpenseItem[],
  salaries: HrSelfServiceSalaryItem[],
  documentRisks: HrSelfServiceDocumentItem[]
): HrSelfServiceSummary {
  const latestSalary = salaries[0];

  return {
    pendingLeaveCount: leaves.length,
    pendingExpenseCount: expenses.length,
    latestSalaryNetPay: latestSalary?.netPay ?? 0,
    latestSalaryCurrency: latestSalary?.currency ?? DEFAULT_CURRENCY,
    riskDocumentCount: documentRisks.length
  };
}

export async function fetchHrSelfServiceData(): Promise<HrSelfServiceData> {
  const [canReadEmployee, canReadAttendance, canReadLeave, canReadExpense, canReadSalary, canReadDocumentRecord] = await Promise.all([
    canReadDoctype("Employee"),
    canReadDoctype("Attendance"),
    canReadDoctype("Leave Application"),
    canReadDoctype("Expense Claim"),
    canReadDoctype("Salary Slip"),
    canReadDoctype("Employee Document Record")
  ]);

  if (!canReadEmployee) {
    return {
      profile: null,
      attendance: mapAttendance([]),
      pendingLeaves: [],
      pendingExpenses: [],
      recentSalaries: [],
      recentDocuments: [],
      documentRisks: [],
      fileRefOptions: [],
      summary: buildSummary([], [], [], []),
      infoMessage: "Employee kaydini okuma yetkiniz bulunmuyor."
    };
  }

  const loggedUser = await getLoggedUserEmail();
  if (!loggedUser) {
    return {
      profile: null,
      attendance: mapAttendance([]),
      pendingLeaves: [],
      pendingExpenses: [],
      recentSalaries: [],
      recentDocuments: [],
      documentRisks: [],
      fileRefOptions: [],
      summary: buildSummary([], [], [], []),
      infoMessage: "Oturum kullanicisi cozulenemedi."
    };
  }

  const employee = await getEmployeeByUser(loggedUser);
  if (!employee?.name) {
    return {
      profile: null,
      attendance: mapAttendance([]),
      pendingLeaves: [],
      pendingExpenses: [],
      recentSalaries: [],
      recentDocuments: [],
      documentRisks: [],
      fileRefOptions: [],
      summary: buildSummary([], [], [], []),
      infoMessage: "Bu kullaniciya bagli personel kaydi bulunamadi."
    };
  }

  const employeeId = employee.name;
  const pendingLeaveStatuses = ["Open", "Pending Approval"];
  const pendingExpenseStatuses = ["Draft", "Open", "Pending", "Pending Approval", "Submitted"];
  const attendanceFromDate = todayMinusDays(7);

  const [attendanceRows, leaveRows, expenseRows, salaryRows, documentRows] = await Promise.all([
    canReadAttendance
      ? requestResourceList<AttendanceRow>("Attendance", {
          fields: ["name", "attendance_date", "status"],
          filters: [
            ["employee", "=", employeeId],
            ["attendance_date", ">=", attendanceFromDate]
          ],
          orderBy: "attendance_date desc",
          limit: 30
        })
      : Promise.resolve([]),
    canReadLeave
      ? requestResourceList<LeaveApplicationRow>("Leave Application", {
          fields: ["name", "leave_type", "from_date", "to_date", "status"],
          filters: [
            ["employee", "=", employeeId],
            ["status", "in", pendingLeaveStatuses]
          ],
          orderBy: "from_date asc",
          limit: 20
        })
      : Promise.resolve([]),
    canReadExpense
      ? requestResourceList<ExpenseClaimRow>("Expense Claim", {
          fields: ["name", "expense_type", "posting_date", "status", "grand_total", "total_sanctioned_amount", "currency"],
          filters: [
            ["employee", "=", employeeId],
            ["status", "in", pendingExpenseStatuses]
          ],
          orderBy: "modified desc",
          limit: 20
        })
      : Promise.resolve([]),
    canReadSalary
      ? requestResourceList<SalarySlipRow>("Salary Slip", {
          fields: ["name", "posting_date", "net_pay", "currency", "status"],
          filters: [["employee", "=", employeeId]],
          orderBy: "posting_date desc",
          limit: 3
        })
      : Promise.resolve([]),
    canReadDocumentRecord ? fetchDocumentRows(employeeId) : Promise.resolve([])
  ]);

  const attendance = mapAttendance(attendanceRows);
  const pendingLeaves = mapLeaves(leaveRows).slice(0, 8);
  const pendingExpenses = mapExpenses(expenseRows).slice(0, 8);
  const recentSalaries = mapSalaries(salaryRows).slice(0, 3);
  const recentDocuments = mapRecentDocuments(documentRows).slice(0, 8);
  const documentRisks = mapDocumentRisks(documentRows).slice(0, 8);
  const fileRefOptions = mapFileRefOptions(documentRows).slice(0, 50);
  const summary = buildSummary(pendingLeaves, pendingExpenses, recentSalaries, documentRisks);

  return {
    profile: {
      employeeId,
      employeeName: employee.employee_name?.trim() || employeeId,
      department: employee.department?.trim() || "-",
      designation: employee.designation?.trim() || "-",
      status: employee.status?.trim() || employee.employee_status?.trim() || "Belirsiz",
      joiningDate: employee.date_of_joining ?? null
    },
    attendance,
    pendingLeaves,
    pendingExpenses,
    recentSalaries,
    recentDocuments,
    documentRisks,
    fileRefOptions,
    summary,
    infoMessage: null
  };
}

async function resolveSessionEmployeeId(): Promise<string | null> {
  const loggedUser = await getLoggedUserEmail();
  if (!loggedUser) {
    return null;
  }
  const employee = await getEmployeeByUser(loggedUser);
  return employee?.name ?? null;
}

export async function uploadHrSelfServiceDocumentFile(input: {
  file: File;
  isPrivate: boolean;
}): Promise<{ fileRef: string; fileName: string; fileUrl: string; visibility: "private" | "public" }> {
  const employeeId = await resolveSessionEmployeeId();
  if (!employeeId) {
    throw new Error("Bu kullaniciya bagli personel kaydi bulunamadi.");
  }

  const uploaded = await uploadErpFile({
    file: input.file,
    attachedToDoctype: "Employee",
    attachedToName: employeeId,
    isPrivate: input.isPrivate
  });

  return {
    fileRef: uploaded.name,
    fileName: uploaded.fileName,
    fileUrl: uploaded.fileUrl,
    visibility: uploaded.isPrivate ? "private" : "public"
  };
}

export async function upsertHrSelfServiceDocumentRecord(input: HrSelfServiceDocumentRecordInput): Promise<string> {
  const employeeId = await resolveSessionEmployeeId();
  if (!employeeId) {
    throw new Error("Bu kullaniciya bagli personel kaydi bulunamadi.");
  }

  const payload = await requestErpJson<FrappeMethodResponse<{ name?: string }>>(
    "/method/shipyard_app.personnel_api.upsert_employee_document_record",
    undefined,
    {
      method: "POST",
      body: {
        employee: employeeId,
        document_type: input.documentType.trim(),
        file_ref: input.fileRef.trim() || undefined,
        issue_date: input.issueDate.trim() || undefined,
        expiry_date: input.expiryDate.trim() || undefined,
        status: input.status.trim() || "Pending Review",
        is_required: input.isRequired ? 1 : 0,
        note: input.note.trim() || undefined
      },
      timeoutMs: REQUEST_TIMEOUT_MS
    }
  );

  const recordName = payload.message?.name;
  if (!recordName) {
    throw new Error("Belge kaydi olusturuldu ancak kayit kimligi donmedi.");
  }
  return recordName;
}
