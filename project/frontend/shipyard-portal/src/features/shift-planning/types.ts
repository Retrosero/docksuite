export type ShiftAssignment = {
  name: string;
  employee: string;
  employee_name: string;
  shift_type: string;
  start_date: string;
  end_date: string;
  status: string;
  modified: string;
};

export type ShiftPlanInput = {
  employee: string;
  shift_type: string;
  start_date: string;
  end_date: string;
};

export type ShiftTypeInfo = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
};

export type ShiftPlanEmployee = {
  id: string;
  label: string;
  isDemo?: boolean;
};

export type ShiftPlanningFilterState = {
  shiftType: string;
  employee: string;
  startDate: string;
  endDate: string;
  searchText: string;
};

export type ShiftPlanningSummary = {
  totalAssignments: number;
  activeAssignments: number;
  upcomingAssignments: number;
};

export type ShiftPlanningData = {
  assignments: Array<ShiftAssignment & { shiftLabel?: string }>;
  leaveEntries: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    status: string;
    statusLabel: string;
  }>;
  summary: ShiftPlanningSummary;
  shiftTypes: ShiftTypeInfo[];
  employees: ShiftPlanEmployee[];
  dateLabel: string;
  demoAutoAssignmentCount: number;
};
