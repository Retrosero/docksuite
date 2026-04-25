import { requestErpJson } from "../../../lib/erpApi";
import type {
  PersonnelDocumentItemType,
  PersonnelZimmetItemType,
  PersonnelZimmetSummaryType,
  PersonnelDocumentSummaryType,
  PagedResult,
  PersonnelMonthlyActivity,
  PersonnelMonthlyMovement,
  PersonnelCreateInput,
  PersonnelDetail,
  PersonnelDocumentRecordInput,
  PersonnelZimmetRecordInput,
  PersonnelListItem,
  PersonnelListQuery
} from "../types";

type EmployeeListRow = {
  name?: string;
  employee_name?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  gender?: string;
  designation?: string;
  department?: string;
  branch?: string;
  company?: string;
  date_of_joining?: string;
  date_of_birth?: string;
  cell_number?: string;
  emergency_phone_number?: string;
  company_email?: string;
  personal_email?: string;
  current_address?: string;
  permanent_address?: string;
};

type EmployeeDetailRow = EmployeeListRow & {
  reports_to?: string;
  shipyard_team_ref?: string;
  shipyard_specialty?: string;
};

type AttendanceRow = {
  name?: string;
  attendance_date?: string;
  in_time?: string;
  out_time?: string;
  status?: string;
};

type OvertimeRow = {
  name?: string;
  date?: string;
  hours?: number;
  reason?: string;
  status?: string;
  workflow_state?: string;
};

type AdditionalSalaryRow = {
  name?: string;
  payroll_date?: string;
  salary_component?: string;
  amount?: number;
  docstatus?: number;
};

type SalarySlipRow = {
  name?: string;
  posting_date?: string;
  start_date?: string;
  end_date?: string;
  net_pay?: number;
  docstatus?: number;
};

type LeaveRow = {
  name?: string;
  from_date?: string;
  to_date?: string;
  total_leave_days?: number;
  status?: string;
  workflow_state?: string;
};

type FileRow = {
  name?: string;
  file_name?: string;
  file_url?: string;
  is_private?: number;
  creation?: string;
};

type EmployeeDocumentRecordRow = {
  name?: string;
  document_type?: string;
  file_ref?: string;
  file_name?: string;
  file_url?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: string;
  is_required?: number;
  modified?: string;
  is_private?: number;
};

type EmployeeDocumentRecordResponse = {
  items?: EmployeeDocumentRecordRow[];
};

type EmployeeZimmetRow = {
  name?: string;
  item?: string;
  item_name?: string;
  quantity?: number;
  delivery_date?: string;
  return_date?: string;
  return_status?: string;
  delivered_by?: string;
  note?: string;
};

type EmployeeZimmetResponse = {
  items?: EmployeeZimmetRow[];
};

type PersonnelListResponse = {
  items?: EmployeeListRow[];
  total?: number;
  page?: number;
  pageSize?: number;
};

type PersonnelDetailResponse = {
  employee?: EmployeeDetailRow | null;
};

type PersonnelMutationResponse = {
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
  name?: string;
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

async function requestJson<T>(path: string, params?: URLSearchParams, options: RequestOptions = {}): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: options.method ?? "GET",
    body: options.body,
    timeoutMs: 9000
  });
}

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

  const response = await requestErpJson<{ data?: T[] }>(`/resource/${encodeURIComponent(doctype)}`, params, {
    timeoutMs: 9000
  });
  return response.data ?? [];
}

function getMonthRange(year: number, month: number) {
  const safeYear = Number.isFinite(year) ? Math.trunc(year) : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? Math.min(12, Math.max(1, Math.trunc(month))) : new Date().getMonth() + 1;
  const start = `${safeYear}-${String(safeMonth).padStart(2, "0")}-01`;
  const endDate = new Date(safeYear, safeMonth, 0).getDate();
  const end = `${safeYear}-${String(safeMonth).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`;
  return { year: safeYear, month: safeMonth, start, end };
}

function toHours(inTime: string | undefined, outTime: string | undefined) {
  if (!inTime || !outTime) {
    return 0;
  }
  const inDate = new Date(inTime);
  const outDate = new Date(outTime);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return 0;
  }

  let diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

function toDateOnly(value: string | undefined) {
  if (!value) {
    return "";
  }
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function isAdvanceComponent(value: string | undefined) {
  const text = (value ?? "").trim().toLowerCase();
  if (!text) {
    return false;
  }
  return text.includes("avans") || text.includes("advance");
}

function toLeaveStatusLabel(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "approved") return "Onaylandi";
  if (normalized === "rejected") return "Reddedildi";
  if (normalized === "cancelled") return "Iptal";
  if (normalized === "open") return "Beklemede";
  return value ?? "Belirsiz";
}

function mapPersonnelListItem(row: EmployeeListRow): PersonnelListItem {
  return {
    id: row.name ?? "-",
    fullName: row.employee_name ?? row.name ?? "-",
    status: row.status ?? "-",
    designation: row.designation ?? "-",
    department: row.department ?? "-",
    company: row.company ?? "-",
    joinDate: row.date_of_joining ?? null,
    phone: row.cell_number ?? "-",
    email: row.personal_email ?? "-"
  };
}

function mapPersonnelDetail(row: EmployeeDetailRow): PersonnelDetail {
  const base = mapPersonnelListItem(row);

  return {
    ...base,
    firstName: row.first_name ?? "-",
    lastName: row.last_name ?? "-",
    gender: row.gender ?? "-",
    branch: row.branch ?? "-",
    birthDate: row.date_of_birth ?? null,
    reportsTo: row.reports_to ?? "-",
    companyEmail: row.company_email ?? "-",
    emergencyPhone: row.emergency_phone_number ?? "-",
    currentAddress: row.current_address ?? "-",
    permanentAddress: row.permanent_address ?? "-",
    shipyardTeam: row.shipyard_team_ref ?? "-",
    shipyardSpecialty: row.shipyard_specialty ?? "-",
    salaryInfo: null,
    benefits: [],
    workHistory: null,
    leaveHistory: null,
    overtimeHistory: null,
    documentSummary: {
      totalDocuments: 0,
      missingCount: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
      checklist: [],
      recentDocuments: []
    },
    zimmetSummary: {
      totalAssignments: 0,
      openAssignments: 0,
      fullReturnCount: 0,
      recentAssignments: []
    }
  };
}

type DocumentRule = {
  label: string;
  patterns: string[];
};

const DOCUMENT_RULES: DocumentRule[] = [
  { label: "Kimlik Belgesi", patterns: ["kimlik", "id", "nufus"] },
  { label: "Is Sozlesmesi", patterns: ["sozlesme", "contract"] },
  { label: "Saglik Raporu", patterns: ["saglik", "health", "rapor"] },
  { label: "ISG Egitim Belgesi", patterns: ["isg", "guvenlik", "safety"] },
  { label: "Mesleki Sertifika", patterns: ["sertifika", "certificate"] }
];

function classifyDocumentType(value: string): string {
  const normalized = value.trim().toLowerCase();
  for (const rule of DOCUMENT_RULES) {
    if (rule.patterns.some((pattern) => normalized.includes(pattern))) {
      return rule.label;
    }
  }
  return "Diger Belge";
}

function statusFromDates(expiryDate: string | null): string {
  if (!expiryDate) {
    return "Pending Review";
  }
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return "Pending Review";
  }
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return "Expired";
  }
  if (diffDays <= 30) {
    return "Expiring Soon";
  }
  return "Valid";
}

function mapRecordStatus(rawStatus: string | undefined, expiryDate: string | null) {
  const normalized = (rawStatus ?? "").trim();
  if (normalized) {
    return normalized;
  }
  return statusFromDates(expiryDate);
}

async function getPersonnelDocumentSummary(employeeId: string): Promise<PersonnelDocumentSummaryType> {
  let rows: EmployeeDocumentRecordRow[] = [];
  try {
    const params = new URLSearchParams();
    params.set("employee_id", employeeId);
    const response = await requestJson<FrappeMethodResponse<EmployeeDocumentRecordResponse>>(
      "/method/shipyard_app.personnel_api.list_employee_document_records",
      params
    );
    rows = response.message?.items ?? [];
  } catch {
    rows = await requestResourceList<FileRow>("File", {
      fields: ["name", "file_name", "file_url", "is_private", "creation"],
      filters: [
        ["attached_to_doctype", "=", "Employee"],
        ["attached_to_name", "=", employeeId]
      ],
      orderBy: "creation desc",
      limit: 50
    }).then((fileRows) =>
      fileRows.map((row) => ({
        name: row.name,
        document_type: classifyDocumentType(row.file_name ?? row.name ?? ""),
        file_ref: row.name,
        file_name: row.file_name,
        file_url: row.file_url,
        issue_date: undefined,
        expiry_date: undefined,
        status: "Pending Review",
        is_required: 1,
        modified: row.creation,
        is_private: row.is_private
      }))
    );
  }

  const recentDocuments: PersonnelDocumentItemType[] = rows
    .map((row) => {
      const fileName = row.file_name?.trim() || row.file_ref?.trim() || row.name || "Belge";
      const visibility: "private" | "public" = row.is_private === 1 ? "private" : "public";
      const documentType = row.document_type?.trim() || classifyDocumentType(fileName);
      const expiryDate = row.expiry_date ?? null;
      const status = mapRecordStatus(row.status, expiryDate);
      return {
        id: row.name ?? fileName,
        fileName,
        fileUrl: row.file_url?.trim() || "",
        fileRef: row.file_ref ?? "",
        uploadedAt: row.modified ?? null,
        issueDate: row.issue_date ?? null,
        expiryDate,
        status,
        visibility,
        documentType
      };
    })
    .filter((item) => item.fileUrl.length > 0);

  const requiredTypes = new Set<string>(DOCUMENT_RULES.map((rule) => rule.label));
  rows.forEach((row) => {
    if (row.is_required === 1 && row.document_type?.trim()) {
      requiredTypes.add(row.document_type.trim());
    }
  });

  const checklist = Array.from(requiredTypes).map((label) => ({
    key: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    present: recentDocuments.some((document) => document.documentType.toLowerCase() === label.toLowerCase())
  }));

  const expiredCount = recentDocuments.filter((document) => document.status.toLowerCase() === "expired").length;
  const expiringSoonCount = recentDocuments.filter((document) => document.status.toLowerCase() === "expiring soon").length;

  return {
    totalDocuments: recentDocuments.length,
    missingCount: checklist.filter((item) => !item.present).length,
    expiredCount,
    expiringSoonCount,
    checklist,
    recentDocuments: recentDocuments.slice(0, 6)
  };
}

async function getPersonnelZimmetSummary(employeeId: string): Promise<PersonnelZimmetSummaryType> {
  let rows: EmployeeZimmetRow[] = [];

  try {
    const params = new URLSearchParams();
    params.set("employee_id", employeeId);
    const response = await requestJson<FrappeMethodResponse<EmployeeZimmetResponse>>(
      "/method/shipyard_app.personnel_api.list_employee_zimmet_records",
      params
    );
    rows = response.message?.items ?? [];
  } catch {
    rows = [];
  }

  const recentAssignments: PersonnelZimmetItemType[] = rows.map((row) => ({
    id: row.name ?? "-",
    itemCode: row.item ?? "-",
    itemName: row.item_name ?? row.item ?? "-",
    quantity: Number(row.quantity ?? 0),
    deliveryDate: row.delivery_date ?? null,
    returnDate: row.return_date ?? null,
    returnStatus: row.return_status ?? "Teslim Edildi",
    deliveredBy: row.delivered_by ?? "-",
    note: row.note ?? ""
  }));

  const fullReturnCount = recentAssignments.filter((record) => record.returnStatus.trim().toLowerCase() === "tam iade").length;
  const openAssignments = recentAssignments.length - fullReturnCount;

  return {
    totalAssignments: recentAssignments.length,
    openAssignments,
    fullReturnCount,
    recentAssignments: recentAssignments.slice(0, 6)
  };
}

function toEmployeeCreatePayload(input: PersonnelCreateInput) {
  return {
    employee_name: input.employeeName.trim(),
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim() || undefined,
    company: input.company.trim(),
    status: input.status.trim(),
    gender: input.gender.trim() || undefined,
    department: input.department.trim() || undefined,
    designation: input.designation.trim() || undefined,
    branch: input.branch.trim() || undefined,
    date_of_joining: input.joinDate.trim() || undefined,
    date_of_birth: input.birthDate.trim() || undefined,
    cell_number: input.phone.trim() || undefined,
    emergency_phone_number: input.emergencyPhone.trim() || undefined,
    company_email: input.companyEmail.trim() || undefined,
    personal_email: input.email.trim() || undefined,
    current_address: input.currentAddress.trim() || undefined,
    permanent_address: input.permanentAddress.trim() || undefined,
    reports_to: input.reportsTo.trim() || undefined,
    shipyard_team_ref: input.shipyardTeam.trim() || undefined,
    shipyard_specialty: input.shipyardSpecialty.trim() || undefined
  };
}

export async function getPersonnelList(query: PersonnelListQuery): Promise<PagedResult<PersonnelListItem>> {
  const safePage = Math.max(query.page, 1);
  const safePageSize = Math.max(query.pageSize, 1);

  const params = new URLSearchParams();
  params.set("search", query.search.trim());
  params.set("page", String(safePage));
  params.set("page_size", String(safePageSize));

  const response = await requestJson<FrappeMethodResponse<PersonnelListResponse>>(
    "/method/shipyard_app.personnel_api.list_employees",
    params
  );
  const payload: PersonnelListResponse = response.message ?? {};
  const items = (payload.items ?? []).map(mapPersonnelListItem);

  return {
    items,
    total: typeof payload.total === "number" ? payload.total : items.length,
    page: typeof payload.page === "number" ? payload.page : safePage,
    pageSize: typeof payload.pageSize === "number" ? payload.pageSize : safePageSize
  };
}

export async function getPersonnelDetail(employeeId: string): Promise<PersonnelDetail | null> {
  const params = new URLSearchParams();
  params.set("employee_id", employeeId);

  const response = await requestJson<FrappeMethodResponse<PersonnelDetailResponse>>(
    "/method/shipyard_app.personnel_api.get_employee",
    params
  );

  if (!response.message?.employee) {
    return null;
  }
  const detail = mapPersonnelDetail(response.message.employee);
  const [documentSummary, zimmetSummary] = await Promise.all([
    getPersonnelDocumentSummary(employeeId),
    getPersonnelZimmetSummary(employeeId)
  ]);
  detail.documentSummary = documentSummary;
  detail.zimmetSummary = zimmetSummary;
  return detail;
}

export async function getPersonnelMonthlyActivity(
  employeeId: string,
  year: number,
  month: number
): Promise<PersonnelMonthlyActivity> {
  const { year: safeYear, month: safeMonth, start, end } = getMonthRange(year, month);

  const attendancePromise = requestResourceList<AttendanceRow>("Attendance", {
    fields: ["name", "attendance_date", "in_time", "out_time", "status"],
    filters: [
      ["employee", "=", employeeId],
      ["attendance_date", ">=", start],
      ["attendance_date", "<=", end]
    ],
    orderBy: "attendance_date desc",
    limit: 200
  });

  const overtimePromise = requestResourceList<OvertimeRow>("Overtime Request", {
    fields: ["name", "date", "hours", "reason", "status", "workflow_state"],
    filters: [
      ["employee", "=", employeeId],
      ["date", ">=", start],
      ["date", "<=", end]
    ],
    orderBy: "date desc",
    limit: 200
  }).catch(async (error) => {
    if (!(error instanceof Error) || !error.message.toLowerCase().includes("field not permitted in query: workflow_state")) {
      throw error;
    }
    return requestResourceList<OvertimeRow>("Overtime Request", {
      fields: ["name", "date", "hours", "reason", "status"],
      filters: [
        ["employee", "=", employeeId],
        ["date", ">=", start],
        ["date", "<=", end]
      ],
      orderBy: "date desc",
      limit: 200
    });
  });

  const additionalSalaryPromise = requestResourceList<AdditionalSalaryRow>("Additional Salary", {
    fields: ["name", "payroll_date", "salary_component", "amount", "docstatus"],
    filters: [
      ["employee", "=", employeeId],
      ["payroll_date", ">=", start],
      ["payroll_date", "<=", end],
      ["docstatus", "=", 1]
    ],
    orderBy: "payroll_date desc",
    limit: 200
  });

  const salarySlipPromise = requestResourceList<SalarySlipRow>("Salary Slip", {
    fields: ["name", "posting_date", "start_date", "end_date", "net_pay", "docstatus"],
    filters: [
      ["employee", "=", employeeId],
      ["posting_date", ">=", start],
      ["posting_date", "<=", end],
      ["docstatus", "=", 1]
    ],
    orderBy: "posting_date desc",
    limit: 100
  });

  const leavePromise = requestResourceList<LeaveRow>("Leave Application", {
    fields: ["name", "from_date", "to_date", "total_leave_days", "status", "workflow_state"],
    filters: [
      ["employee", "=", employeeId],
      ["from_date", "<=", end],
      ["to_date", ">=", start]
    ],
    orderBy: "from_date desc",
    limit: 100
  }).catch(async (error) => {
    if (!(error instanceof Error) || !error.message.toLowerCase().includes("field not permitted in query: workflow_state")) {
      throw error;
    }
    return requestResourceList<LeaveRow>("Leave Application", {
      fields: ["name", "from_date", "to_date", "total_leave_days", "status"],
      filters: [
        ["employee", "=", employeeId],
        ["from_date", "<=", end],
        ["to_date", ">=", start]
      ],
      orderBy: "from_date desc",
      limit: 100
    });
  });

  const [attendanceRows, overtimeRows, additionalSalaryRows, salarySlipRows, leaveRows] = await Promise.all([
    attendancePromise,
    overtimePromise,
    additionalSalaryPromise,
    salarySlipPromise,
    leavePromise
  ]);

  const movements: PersonnelMonthlyMovement[] = [];

  for (const row of attendanceRows) {
    const workedHours = toHours(row.in_time, row.out_time);
    movements.push({
      id: `work-${row.name ?? row.attendance_date ?? Math.random()}`,
      date: toDateOnly(row.attendance_date),
      type: "work",
      title: "Calisma Kaydi",
      detail: `${row.status ?? "Present"} - ${workedHours.toFixed(2)} saat`,
      amount: null,
      durationHours: workedHours,
      tone: workedHours > 0 ? "positive" : "neutral"
    });
  }

  for (const row of overtimeRows) {
    const status = row.workflow_state ?? row.status ?? "Open";
    movements.push({
      id: `overtime-${row.name ?? row.date ?? Math.random()}`,
      date: toDateOnly(row.date),
      type: "overtime",
      title: "Mesai Kaydi",
      detail: `${status} - ${Number(row.hours ?? 0).toFixed(2)} saat${row.reason ? ` - ${row.reason}` : ""}`,
      amount: null,
      durationHours: Number(row.hours ?? 0),
      tone: String(status).toLowerCase() === "approved" ? "positive" : "warning"
    });
  }

  for (const row of additionalSalaryRows) {
    const component = row.salary_component ?? "Ek Odeme";
    const amount = Number(row.amount ?? 0);
    const isAdvance = isAdvanceComponent(component);
    movements.push({
      id: `additional-${row.name ?? row.payroll_date ?? Math.random()}`,
      date: toDateOnly(row.payroll_date),
      type: isAdvance ? "advance" : "adjustment",
      title: isAdvance ? "Avans" : "Ek Odeme/Kesinti",
      detail: component,
      amount,
      durationHours: null,
      tone: isAdvance ? "warning" : "neutral"
    });
  }

  for (const row of salarySlipRows) {
    movements.push({
      id: `salary-slip-${row.name ?? row.posting_date ?? Math.random()}`,
      date: toDateOnly(row.posting_date),
      type: "payment",
      title: "Bordro Odemesi",
      detail: `${toDateOnly(row.start_date)} - ${toDateOnly(row.end_date)}`,
      amount: Number(row.net_pay ?? 0),
      durationHours: null,
      tone: "positive"
    });
  }

  for (const row of leaveRows) {
    const status = toLeaveStatusLabel(row.workflow_state ?? row.status);
    movements.push({
      id: `leave-${row.name ?? row.from_date ?? Math.random()}`,
      date: toDateOnly(row.from_date),
      type: "leave",
      title: "Izin Hareketi",
      detail: `${toDateOnly(row.from_date)} - ${toDateOnly(row.to_date)} | ${Number(row.total_leave_days ?? 0)} gun | ${status}`,
      amount: null,
      durationHours: null,
      tone: status === "Onaylandi" ? "positive" : "neutral"
    });
  }

  movements.sort((left, right) => {
    if (left.date === right.date) {
      return left.title.localeCompare(right.title, "tr");
    }
    return right.date.localeCompare(left.date);
  });

  const totalWorkedHours = movements
    .filter((item) => item.type === "work")
    .reduce((sum, item) => sum + Number(item.durationHours ?? 0), 0);
  const totalOvertimeHours = movements
    .filter((item) => item.type === "overtime")
    .reduce((sum, item) => sum + Number(item.durationHours ?? 0), 0);
  const totalAdvanceAmount = movements
    .filter((item) => item.type === "advance")
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  const totalPaymentAmount = movements
    .filter((item) => item.type === "payment")
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  return {
    year: safeYear,
    month: safeMonth,
    movementCount: movements.length,
    totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    totalAdvanceAmount: Math.round(totalAdvanceAmount * 100) / 100,
    totalPaymentAmount: Math.round(totalPaymentAmount * 100) / 100,
    movements
  };
}

export async function createPersonnel(input: PersonnelCreateInput): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.create_employee",
    undefined,
    {
      method: "POST",
      body: toEmployeeCreatePayload(input)
    }
  );

  const employeeId = response.message?.name;

  if (!employeeId) {
    throw new Error("Kayit olusturuldu ancak employee kimligi donmedi.");
  }

  return employeeId;
}

export async function updatePersonnel(employeeId: string, input: PersonnelCreateInput): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.update_employee",
    undefined,
    {
      method: "POST",
      body: {
        employee_id: employeeId,
        ...toEmployeeCreatePayload(input)
      }
    }
  );

  return response.message?.name ?? employeeId;
}

export async function deletePersonnel(employeeId: string): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.delete_employee",
    undefined,
    {
      method: "POST",
      body: {
        employee_id: employeeId
      }
    }
  );

  return response.message?.name ?? employeeId;
}

export async function upsertPersonnelDocumentRecord(input: PersonnelDocumentRecordInput): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.upsert_employee_document_record",
    undefined,
    {
      method: "POST",
      body: {
        record_id: input.recordId?.trim() || undefined,
        employee: input.employeeId,
        document_type: input.documentType.trim(),
        file_ref: input.fileRef.trim() || undefined,
        issue_date: input.issueDate.trim() || undefined,
        expiry_date: input.expiryDate.trim() || undefined,
        status: input.status.trim() || "Pending Review",
        is_required: input.isRequired ? 1 : 0,
        note: input.note.trim() || undefined
      }
    }
  );

  const name = response.message?.name;
  if (!name) {
    throw new Error("Belge kaydi kaydedildi ancak kayit kimligi donmedi.");
  }
  return name;
}

export async function deletePersonnelDocumentRecord(recordId: string): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.delete_employee_document_record",
    undefined,
    {
      method: "POST",
      body: {
        record_id: recordId
      }
    }
  );

  return response.message?.name ?? recordId;
}

export async function upsertPersonnelZimmetRecord(input: PersonnelZimmetRecordInput): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.upsert_employee_zimmet_record",
    undefined,
    {
      method: "POST",
      body: {
        record_id: input.recordId?.trim() || undefined,
        employee: input.employeeId,
        item: input.item.trim(),
        quantity: input.quantity,
        delivery_date: input.deliveryDate.trim() || undefined,
        return_date: input.returnDate.trim() || undefined,
        return_status: input.returnStatus.trim() || "Teslim Edildi",
        delivered_by: input.deliveredBy.trim() || undefined,
        note: input.note.trim() || undefined
      }
    }
  );

  const name = response.message?.name;
  if (!name) {
    throw new Error("Zimmet kaydi kaydedildi ancak kayit kimligi donmedi.");
  }
  return name;
}

export async function deletePersonnelZimmetRecord(recordId: string): Promise<string> {
  const response = await requestJson<FrappeMethodResponse<PersonnelMutationResponse>>(
    "/method/shipyard_app.personnel_api.delete_employee_zimmet_record",
    undefined,
    {
      method: "POST",
      body: {
        record_id: recordId
      }
    }
  );

  return response.message?.name ?? recordId;
}
