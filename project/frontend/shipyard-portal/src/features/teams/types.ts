// Team feature type definitions

export type TeamMember = {
  id: string;
  name: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  teamRef?: string;
  employmentType?: string;
  status: "Aktif" | "Pasif" | "Izinli";
};

export type TeamGroup = {
  teamName: string;
  leadName: string;
  specialty: string;
  members: TeamMember[];
  shift?: string;
  memberCount: number;
  activeCount: number;
};

export type TeamFilterState = {
  department: string;
  designation: string;
  status: string;
  searchText: string;
};

export type TeamSummary = {
  totalMembers: number;
  activeMembers: number;
  totalTeams: number;
  departments: number;
};

export type TeamData = {
  members: TeamMember[];
  teams: TeamGroup[];
  summary: TeamSummary;
  departmentOptions: string[];
  designationOptions: string[];
  statusOptions: ("Aktif" | "Pasif" | "Izinli")[];
};

export type EmployeeApiRow = {
  name?: string;
  employee_name?: string;
  designation?: string;
  department?: string;
  shipyard_team_ref?: string;
  employment_type?: string;
  status?: string;
};

export type DepartmentApiRow = {
  name?: string;
  department_name?: string;
};

export type FrappeListResponse<T> = {
  data?: T[];
};
