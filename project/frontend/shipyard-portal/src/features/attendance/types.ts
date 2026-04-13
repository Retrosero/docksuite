export type ShiftTrackingViewMode = "foreman" | "worker";

export type ShiftFilterState = {
  shiftType: string;
  status: string;
  searchText: string;
};

export type ShiftTypeOption = {
  id: string;
  label: string;
  timeRange: string;
  isActive: boolean;
};

export type ShiftEmployeeRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  teamName: string;
  shiftLabel: string;
  status: string;
  statusLabel: string;
  statusTone: "positive" | "negative" | "warning" | "neutral";
  designation: string;
  checkinTimeLabel: string;
  checkoutTimeLabel: string;
};

export type ShiftTeamSummary = {
  teamName: string;
  total: number;
  present: number;
  absent: number;
  other: number;
};

export type ShiftSummary = {
  total: number;
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  shiftTypeCount: number;
  teamCount: number;
};

export type ShiftTrackingData = {
  dateLabel: string;
  shiftTypes: ShiftTypeOption[];
  summary: ShiftSummary;
  teamSummary: ShiftTeamSummary[];
  employeeRows: ShiftEmployeeRow[];
  activeEmployeeId: string | null;
};
