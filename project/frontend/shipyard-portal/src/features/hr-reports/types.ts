export type HrAttendanceRiskItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  status: string;
  attendanceDate: string | null;
};

export type HrLeavePendingItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string | null;
  toDate: string | null;
  status: string;
};

export type HrDocumentRiskItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType: string;
  status: string;
  expiryDate: string | null;
};

export type HrReportsSummary = {
  totalEmployeeCount: number;
  activeEmployeeCount: number;
  pendingLeaveCount: number;
  pendingOvertimeCount: number;
  salarySlipCount: number;
  salaryNetPayTotal: number;
  attendanceRiskCount: number;
  documentRiskCount: number;
};

export type HrReportsData = {
  attendanceRisks: HrAttendanceRiskItem[];
  pendingLeaves: HrLeavePendingItem[];
  documentRisks: HrDocumentRiskItem[];
  summary: HrReportsSummary;
};
