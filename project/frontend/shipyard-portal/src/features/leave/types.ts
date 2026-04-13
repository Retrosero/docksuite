export type LeaveTrackingViewMode = "employee" | "manager";

export type LeaveActorAccess = {
  user: string | null;
  roles: string[];
  canViewManager: boolean;
  defaultViewMode: LeaveTrackingViewMode;
};

export type LeaveFilterState = {
  leaveType: string;
  status: string;
  searchText: string;
};

export type LeaveStatusTone = "positive" | "negative" | "warning" | "neutral";

export type LeaveApplicationItem = {
  id: string;
  applicationId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDateLabel: string;
  toDateLabel: string;
  totalDays: number;
  status: string;
  statusLabel: string;
  statusTone: LeaveStatusTone;
};

export type LeaveAllocationSummaryItem = {
  id: string;
  leaveType: string;
  periodLabel: string;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  recordCount: number;
};

export type LeaveSummary = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  cancelledApplications: number;
  myOpenRequestCount: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
};

export type LeaveTrackingData = {
  dateLabel: string;
  activeEmployeeId: string | null;
  applications: LeaveApplicationItem[];
  allocations: LeaveAllocationSummaryItem[];
  leaveTypeOptions: string[];
  summary: LeaveSummary;
};
