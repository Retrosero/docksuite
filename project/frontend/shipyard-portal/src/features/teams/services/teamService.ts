import { tenantConfig } from "../../../config/tenant";
import { requestErpJson } from "../../../lib/erpApi";
import type {
  DepartmentApiRow,
  EmployeeApiRow,
  FrappeListResponse,
  TeamData,
  TeamFilterState,
  TeamGroup,
  TeamMember
} from "../types";

const REQUEST_TIMEOUT_MS = 9000;
const DEFAULT_LIMIT = 250;

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

async function requestJson<T>(path: string, params?: URLSearchParams): Promise<T> {
  return requestErpJson<T>(path, params, {
    method: "GET",
    timeoutMs: REQUEST_TIMEOUT_MS
  });
}

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? DEFAULT_LIMIT));

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

function toTeamMemberRow(row: EmployeeApiRow): TeamMember {
  const status = normalizeStatus(row.status);
  
  return {
    id: row.name ?? "-",
    name: row.name ?? "-",
    employeeId: row.name ?? "-",
    employeeName: row.employee_name?.trim() || row.name || "-",
    designation: row.designation?.trim() || "-",
    department: row.department?.trim() || "-",
    teamRef: row.shipyard_team_ref?.trim(),
    employmentType: row.employment_type?.trim(),
    status
  };
}

function normalizeStatus(status: string | undefined): "Aktif" | "Pasif" | "Izinli" {
  const normalized = (status ?? "").trim().toLowerCase();
  
  if (normalized === "active") return "Aktif";
  if (normalized === "inactive") return "Pasif";
  if (normalized.includes("leave") || normalized.includes("izin")) return "Izinli";
  
  return "Aktif";
}

function buildTeamFilters(state: TeamFilterState): unknown[] {
  const filters: unknown[] = [];

  if (state.department.trim().length > 0) {
    filters.push(["department", "=", state.department.trim()]);
  }

  if (state.designation.trim().length > 0) {
    filters.push(["designation", "=", state.designation.trim()]);
  }

  if (state.status.trim().length > 0) {
    filters.push(["status", "=", state.status.trim()]);
  }

  return filters;
}

function applySearch(members: TeamMember[], searchText: string): TeamMember[] {
  const normalizedSearch = searchText.trim().toLowerCase();
  if (!normalizedSearch) return members;

  return members.filter((row) => {
    return (
      row.employeeName.toLowerCase().includes(normalizedSearch) ||
      row.employeeId.toLowerCase().includes(normalizedSearch) ||
      row.designation.toLowerCase().includes(normalizedSearch) ||
      row.department.toLowerCase().includes(normalizedSearch) ||
      (row.teamRef ?? "").toLowerCase().includes(normalizedSearch)
    );
  });
}

function buildSummary(members: TeamMember[]): TeamData["summary"] {
  const uniqueDepartments = new Set(members.map((m) => m.department).filter((d) => d !== "-"));
  const uniqueTeams = new Set(members.map((m) => m.teamRef).filter((t) => t && t !== ""));

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "Aktif").length,
    totalTeams: uniqueTeams.size || 1,
    departments: uniqueDepartments.size
  };
}

function groupByTeam(members: TeamMember[]): TeamGroup[] {
  const teamMap = new Map<string, TeamGroup>();

  for (const member of members) {
    const teamName = member.teamRef || "Atanmamış Ekip";
    const existing = teamMap.get(teamName);

    if (existing) {
      existing.members.push(member);
      existing.memberCount = existing.members.length;
      existing.activeCount = existing.members.filter((m) => m.status === "Aktif").length;
    } else {
      teamMap.set(teamName, {
        teamName,
        leadName: member.designation || "-",
        specialty: member.department || "-",
        members: [member],
        memberCount: 1,
        activeCount: member.status === "Aktif" ? 1 : 0
      });
    }
  }

  return [...teamMap.values()].sort((a, b) => b.memberCount - a.memberCount);
}

function getUniqueValues<T>(items: T[], getter: (item: T) => string | undefined): string[] {
  const values = new Set<string>();
  for (const item of items) {
    const value = getter(item);
    if (value?.trim()) {
      values.add(value.trim());
    }
  }
  return [...values].sort((a, b) => a.localeCompare(b, "tr"));
}

export async function fetchTeamData(filters: TeamFilterState): Promise<TeamData> {
  const apiFilters = buildTeamFilters(filters);

  let employeeRows: EmployeeApiRow[] = [];
  let departmentRows: DepartmentApiRow[] = [];

  try {
    employeeRows = await requestResourceList<EmployeeApiRow>("Employee", {
      fields: [
        "name",
        "employee_name",
        "designation",
        "department",
        "shipyard_team_ref",
        "employment_type",
        "status"
      ],
      filters: apiFilters.length > 0 ? apiFilters : undefined,
      orderBy: "employee_name asc",
      limit: DEFAULT_LIMIT
    });

    departmentRows = await requestResourceList<DepartmentApiRow>("Department", {
      fields: ["name", "department_name"],
      limit: 100
    });
  } catch {
    // API başarısız - boş veri dön
    return {
      members: [],
      teams: [],
      summary: { totalMembers: 0, activeMembers: 0, totalTeams: 0, departments: 0 },
      departmentOptions: [],
      designationOptions: [],
      statusOptions: ["Aktif", "Pasif", "Izinli"]
    };
  }

  const mappedMembers = employeeRows.map(toTeamMemberRow);
  const searchedMembers = applySearch(mappedMembers, filters.searchText);

  const departmentOptions = departmentRows
    .map((d) => (d.department_name?.trim() || d.name || "").trim())
    .filter((d): d is string => d.length > 0)
    .sort((a, b) => a.localeCompare(b, "tr"));

  const designationOptions = getUniqueValues(employeeRows, (r) => r.designation);
  const teams = groupByTeam(searchedMembers);

  return {
    members: searchedMembers,
    teams,
    summary: buildSummary(searchedMembers),
    departmentOptions,
    designationOptions,
    statusOptions: ["Aktif", "Pasif", "Izinli"]
  };
}
