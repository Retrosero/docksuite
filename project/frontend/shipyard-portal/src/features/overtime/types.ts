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
  overtime_batch?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
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

export type OvertimeBulkCreateInput = {
  employeeIds: string[];
  date: string;
  hours: number;
  reason: string;
};

export type OvertimeBulkCreateResult = {
  ok: boolean;
  batch: string;
  total: number;
  created_count: number;
  skipped_count: number;
  failed_count: number;
  created_requests: string[];
  skipped_employees: string[];
  failed_rows: Array<{ employee: string; message: string }>;
};
