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
