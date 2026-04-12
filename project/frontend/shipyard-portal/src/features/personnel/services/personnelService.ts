import { tenantConfig } from "../../../config/tenant";
import type { PagedResult, PersonnelDetail, PersonnelListItem, PersonnelListQuery } from "../types";

type EmployeeListRow = {
  name?: string;
  employee_name?: string;
  status?: string;
  designation?: string;
  department?: string;
  company?: string;
  date_of_joining?: string;
  cell_number?: string;
  personal_email?: string;
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

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

async function requestJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  const response = await fetch(buildApiUrl(path, params), {
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    exc_type?: string;
    _server_messages?: string;
  };

  if (!response.ok) {
    const fallbackMessage = `ERPNext istegi basarisiz oldu (${response.status})`;
    const errorMessage = payload.message ?? payload.exc_type ?? fallbackMessage;
    throw new ApiError(errorMessage, response.status);
  }

  return payload as T;
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
    reportsTo: row.reports_to ?? "-",
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
  const start = (safePage - 1) * safePageSize;
  const filters = toSearchFilters(query.search);

  const listParams = new URLSearchParams();
  listParams.set("fields", JSON.stringify(PERSONNEL_LIST_FIELDS));
  listParams.set("order_by", "modified desc");
  listParams.set("limit_start", String(start));
  listParams.set("limit_page_length", String(safePageSize));

  if (filters) {
    listParams.set("or_filters", JSON.stringify(filters));
  }

  const [listResult, total] = await Promise.all([
    requestJson<FrappeListResponse<EmployeeListRow>>("/resource/Employee", listParams),
    getPersonnelCount(query.search)
  ]);

  return {
    items: (listResult.data ?? []).map(mapPersonnelListItem),
    total,
    page: safePage,
    pageSize: safePageSize
  };
}

export async function getPersonnelDetail(employeeId: string): Promise<PersonnelDetail | null> {
  const detailParams = new URLSearchParams();
  detailParams.set("fields", JSON.stringify(PERSONNEL_DETAIL_FIELDS));

  try {
    const detailResult = await requestJson<{ data?: EmployeeDetailRow }>(
      `/resource/Employee/${encodeURIComponent(employeeId)}`,
      detailParams
    );

    if (!detailResult.data) {
      return null;
    }

    return mapPersonnelDetail(detailResult.data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    const fallbackParams = new URLSearchParams();
    fallbackParams.set("fields", JSON.stringify(PERSONNEL_DETAIL_FALLBACK_FIELDS));
    const fallbackResult = await requestJson<{ data?: EmployeeDetailRow }>(
      `/resource/Employee/${encodeURIComponent(employeeId)}`,
      fallbackParams
    );

    return fallbackResult.data ? mapPersonnelDetail(fallbackResult.data) : null;
  }
}
