import { tenantConfig } from "../../../config/tenant";
import { requestErpJson } from "../../../lib/erpApi";
import type {
  PagedResult,
  PersonnelCreateInput,
  PersonnelDetail,
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

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const PERSONNEL_LIST_FIELDS = [
  "name",
  "employee_name",
  "status",
  "designation",
  "department",
  "company",
  "date_of_joining",
  "cell_number",
  "personal_email"
];

const PERSONNEL_DETAIL_FIELDS = [...PERSONNEL_LIST_FIELDS, "reports_to", "shipyard_team_ref", "shipyard_specialty"];
const PERSONNEL_DETAIL_FALLBACK_FIELDS = [...PERSONNEL_LIST_FIELDS, "reports_to"];
let csrfTokenCache: string | null = null;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

function getCookieValue(key: string) {
  const cookieText = document.cookie || "";
  const parts = cookieText.split(";").map((item) => item.trim());

  for (const part of parts) {
    if (part.startsWith(`${key}=`)) {
      return decodeURIComponent(part.slice(key.length + 1));
    }
  }

  return null;
}

async function requestJson<T>(path: string, params?: URLSearchParams, options: RequestOptions = {}): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: options.method ?? "GET",
    body: options.body,
    timeoutMs: 9000
  });
}

function parseServerMessage(payload: {
  message?: string | { message?: string };
  _server_messages?: string;
}) {
  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message.trim();
  }

  if (typeof payload.message === "object" && payload.message?.message) {
    return payload.message.message;
  }

  const encodedMessages = payload._server_messages;

  if (!encodedMessages) {
    return null;
  }

  try {
    const outer = JSON.parse(encodedMessages) as string[];

    for (const entry of outer) {
      try {
        const parsed = JSON.parse(entry) as { message?: string };
        if (parsed.message && parsed.message.trim().length > 0) {
          return parsed.message.trim();
        }
      } catch {
        if (typeof entry === "string" && entry.trim().length > 0) {
          return entry.trim();
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

function toSearchFilters(search: string) {
  const term = search.trim();

  if (!term) {
    return null;
  }

  return [
    ["Employee", "name", "like", `%${term}%`],
    ["Employee", "employee_name", "like", `%${term}%`],
    ["Employee", "department", "like", `%${term}%`],
    ["Employee", "designation", "like", `%${term}%`]
  ];
}

function mapPersonnelListItem(row: EmployeeListRow): PersonnelListItem {
  return {
    id: row.name ?? "-",
    fullName: row.employee_name ?? "-",
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
    shipyardSpecialty: row.shipyard_specialty ?? "-"
  };
}

async function getPersonnelCount(search: string) {
  const filters = toSearchFilters(search);
  const params = new URLSearchParams();
  params.set("doctype", "Employee");

  if (filters) {
    params.set("or_filters", JSON.stringify(filters));
  }

  try {
    const reportViewResult = await requestJson<FrappeMethodResponse<number>>(
      "/method/frappe.desk.reportview.get_count",
      params
    );
    const message = reportViewResult.message;

    if (typeof message === "number") {
      return message;
    }
  } catch {
    // Fallback endpoint below.
  }

  const fallbackResult = await requestJson<FrappeMethodResponse<number>>("/method/frappe.client.get_count", params);
  return typeof fallbackResult.message === "number" ? fallbackResult.message : 0;
}

export async function getPersonnelList(query: PersonnelListQuery): Promise<PagedResult<PersonnelListItem>> {
  const safePage = Math.max(query.page, 1);
  const safePageSize = Math.max(query.pageSize, 1);
  const listParams = new URLSearchParams();
  listParams.set("search", query.search);
  listParams.set("page", String(safePage));
  listParams.set("page_size", String(safePageSize));

  const listResult = await requestJson<FrappeMethodResponse<{ items?: EmployeeListRow[]; total?: number; page?: number; pageSize?: number }>>(
    "/method/shipyard_app.personnel_api.list_employees",
    listParams
  );
  const message = listResult.message ?? {};

  return {
    items: (message.items ?? []).map(mapPersonnelListItem),
    total: message.total ?? 0,
    page: message.page ?? safePage,
    pageSize: message.pageSize ?? safePageSize
  };
}

export async function getPersonnelDetail(employeeId: string): Promise<PersonnelDetail | null> {
  const detailParams = new URLSearchParams();
  detailParams.set("employee_id", employeeId);

  const detailResult = await requestJson<FrappeMethodResponse<{ employee?: EmployeeDetailRow | null }>>(
    "/method/shipyard_app.personnel_api.get_employee",
    detailParams
  );

  return detailResult.message?.employee ? mapPersonnelDetail(detailResult.message.employee) : null;
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

export async function createPersonnel(input: PersonnelCreateInput): Promise<string> {
  const payload = toEmployeeCreatePayload(input);
  let response: { data?: { name?: string }; message?: { name?: string } };

  try {
    response = await requestJson<{ data?: { name?: string }; message?: { name?: string } }>(
      "/method/shipyard_app.personnel_api.create_employee",
      undefined,
      {
      method: "POST",
      body: payload
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }

    throw error;
  }

  const employeeId = response.message?.name ?? response.data?.name;

  if (!employeeId) {
    throw new Error("Kayit olusturuldu ancak employee kimligi donmedi.");
  }

  return employeeId;
}

export async function updatePersonnel(employeeId: string, input: PersonnelCreateInput): Promise<string> {
  const response = await requestJson<{ message?: { name?: string } }>(
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
  const response = await requestJson<{ message?: { name?: string } }>(
    "/method/shipyard_app.personnel_api.delete_employee",
    undefined,
    {
      method: "POST",
      body: { employee_id: employeeId }
    }
  );

  return response.message?.name ?? employeeId;
}
