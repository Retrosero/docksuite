export type HrSelfServiceEmployeeProfile = {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  status: string;
  joiningDate: string | null;
};

export type HrSelfServiceAttendanceSnapshot = {
  latestDate: string | null;
  latestStatus: string;
  presentCountLast7Days: number;
  absentCountLast7Days: number;
  leaveCountLast7Days: number;
};

export type HrSelfServiceLeaveItem = {
  id: string;
  leaveType: string;
  fromDate: string | null;
  toDate: string | null;
  status: string;
};

export type HrSelfServiceExpenseItem = {
  id: string;
  claimType: string;
  postingDate: string | null;
  status: string;
  amount: number;
  currency: string;
};

export type HrSelfServiceSalaryItem = {
  id: string;
  postingDate: string | null;
  netPay: number;
  currency: string;
  status: string;
};

export type HrSelfServiceDocumentItem = {
  id: string;
  documentType: string;
  fileRef: string;
  fileName: string;
  fileUrl: string;
  visibility: "private" | "public";
  status: string;
  issueDate: string | null;
  expiryDate: string | null;
};

export type HrSelfServiceDocumentFileRefOption = {
  fileRef: string;
  fileName: string;
  fileUrl: string;
  visibility: "private" | "public";
};

export type HrSelfServiceSummary = {
  pendingLeaveCount: number;
  pendingExpenseCount: number;
  latestSalaryNetPay: number;
  latestSalaryCurrency: string;
  riskDocumentCount: number;
};

export type HrSelfServiceData = {
  profile: HrSelfServiceEmployeeProfile | null;
  attendance: HrSelfServiceAttendanceSnapshot;
  pendingLeaves: HrSelfServiceLeaveItem[];
  pendingExpenses: HrSelfServiceExpenseItem[];
  recentSalaries: HrSelfServiceSalaryItem[];
  recentDocuments: HrSelfServiceDocumentItem[];
  documentRisks: HrSelfServiceDocumentItem[];
  requiredDocumentTypes: string[];
  fileRefOptions: HrSelfServiceDocumentFileRefOption[];
  summary: HrSelfServiceSummary;
  infoMessage: string | null;
};

export type HrSelfServiceDocumentRecordInput = {
  documentType: string;
  fileRef: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  isRequired: boolean;
  note: string;
};
