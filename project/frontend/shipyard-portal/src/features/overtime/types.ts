export type OvertimeRequest = {
  name: string;
  employee: string;
  employee_name: string;
  date: string;
  hours: number;
  reason: string;
  status: string;
  workflow_state: string;
  modified: string;
};

export type OvertimeSummary = {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalHours: number;
  approvedHours: number;
};

export type OvertimeFilterState = {
  employee: string;
  status: string;
  startDate: string;
  endDate: string;
  searchText: string;
};

export type OvertimeActorAccess = {
  user: string | null;
  roles: string[];
  canViewManager: boolean;
  canApprove: boolean;
  defaultViewMode: "employee" | "manager";
};

export type OvertimeData = {
  dateLabel: string;
  requests: OvertimeRequest[];
  summary: OvertimeSummary;
  employeeOptions: OvertimeEmployeeOption[];
  activeEmployeeId: string | null;
};

export type OvertimeEmployeeOption = {
  id: string;
  label: string;
};

export type OvertimeCreateInput = {
  employee: string;
  date: string;
  hours: number;
  reason: string;
};
