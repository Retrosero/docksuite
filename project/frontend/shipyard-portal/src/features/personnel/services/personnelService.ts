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

async function requestJson<T>(path: string, params?: URLSearchParams, options: RequestOptions = {}): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: options.method ?? "GET",
    body: options.body,
    timeoutMs: 9000
  });
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
    overtimeHistory: null
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

  return mapPersonnelDetail(response.message.employee);
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
