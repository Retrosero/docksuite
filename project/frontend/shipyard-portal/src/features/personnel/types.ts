export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PersonnelListQuery = {
  search: string;
  page: number;
  pageSize: number;
};

export type PersonnelListItem = {
  id: string;
  fullName: string;
  status: string;
  designation: string;
  department: string;
  company: string;
  joinDate: string | null;
  phone: string;
  email: string;
};

export type PersonnelDetail = PersonnelListItem & {
  firstName: string;
  lastName: string;
  gender: string;
  branch: string;
  birthDate: string | null;
  reportsTo: string;
  companyEmail: string;
  emergencyPhone: string;
  currentAddress: string;
  permanentAddress: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
  // Salary & Benefits
  salaryInfo: SalaryInfoType | null;
  benefits: BenefitItemType[];
  // Work history
  workHistory: WorkHistoryType | null;
  // Leave history
  leaveHistory: LeaveHistoryType | null;
  // Overtime history
  overtimeHistory: OvertimeHistoryType | null;
  // Employee document summary
  documentSummary: PersonnelDocumentSummaryType;
  // Employee asset assignment summary
  zimmetSummary: PersonnelZimmetSummaryType;
  // Employee attendance summary
  attendanceSummary: PersonnelAttendanceSummaryType;
  // Employee onboarding summary
  onboardingSummary: PersonnelOnboardingSummaryType;
};

export type PersonnelMonthlyMovement = {
  id: string;
  date: string;
  type: "work" | "overtime" | "advance" | "payment" | "leave" | "adjustment";
  title: string;
  detail: string;
  amount: number | null;
  durationHours: number | null;
  tone: "neutral" | "positive" | "warning";
};

export type PersonnelMonthlyActivity = {
  year: number;
  month: number;
  movementCount: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  totalAdvanceAmount: number;
  totalPaymentAmount: number;
  movements: PersonnelMonthlyMovement[];
};

// Inline types to avoid circular imports
export type SalaryInfoType = {
  name: string;
  employee: string;
  baseSalary: number;
  currency: string;
  payGrade: string;
  effectiveFrom: string | null;
};

export type BenefitItemType = {
  id: string;
  name: string;
  benefitName: string;
  type: "allowance" | "deduction";
  amount: number;
  isTaxable: boolean;
};

export type WorkHistoryType = {
  period: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHoursWorked: number;
  overtimeHours: number;
};

export type LeaveHistoryType = {
  totalApplications: number;
  approvedDays: number;
  pendingDays: number;
  rejectedDays: number;
};

export type OvertimeHistoryType = {
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  rejectedHours: number;
};

export type PersonnelDocumentChecklistItemType = {
  key: string;
  label: string;
  present: boolean;
};

export type PersonnelDocumentItemType = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileRef: string;
  uploadedAt: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: string;
  visibility: "private" | "public";
  documentType: string;
};

export type PersonnelDocumentFileRefOptionType = {
  fileRef: string;
  fileName: string;
  fileUrl: string;
  visibility: "private" | "public";
};

export type PersonnelDocumentSummaryType = {
  totalDocuments: number;
  missingCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  checklist: PersonnelDocumentChecklistItemType[];
  recentDocuments: PersonnelDocumentItemType[];
  fileRefOptions: PersonnelDocumentFileRefOptionType[];
};

export type PersonnelDocumentRecordInput = {
  recordId?: string;
  employeeId: string;
  documentType: string;
  fileRef: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  isRequired: boolean;
  note: string;
};

export type PersonnelZimmetItemType = {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  deliveryDate: string | null;
  returnDate: string | null;
  returnStatus: string;
  deliveredBy: string;
  note: string;
};

export type PersonnelZimmetSummaryType = {
  totalAssignments: number;
  openAssignments: number;
  fullReturnCount: number;
  recentAssignments: PersonnelZimmetItemType[];
};

export type PersonnelZimmetRecordInput = {
  recordId?: string;
  employeeId: string;
  item: string;
  quantity: number;
  deliveryDate: string;
  returnDate: string;
  returnStatus: string;
  deliveredBy: string;
  note: string;
};

export type PersonnelAttendanceItemType = {
  id: string;
  attendanceDate: string | null;
  status: string;
  shift: string;
  inTime: string | null;
  outTime: string | null;
  workingHours: number;
};

export type PersonnelAttendanceSummaryType = {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  recentRecords: PersonnelAttendanceItemType[];
};

export type PersonnelAttendanceRecordInput = {
  recordId?: string;
  employeeId: string;
  attendanceDate: string;
  status: string;
  shift: string;
  inTime: string;
  outTime: string;
};

export type PersonnelOnboardingItemType = {
  id: string;
  status: string;
  startDate: string | null;
  joinDate: string | null;
  department: string;
  designation: string;
  updatedAt: string | null;
};

export type PersonnelOnboardingSummaryType = {
  totalRecords: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  recentRecords: PersonnelOnboardingItemType[];
};

export type PersonnelCreateInput = {
  employeeName: string;
  firstName: string;
  lastName: string;
  company: string;
  status: string;
  gender: string;
  department: string;
  designation: string;
  branch: string;
  joinDate: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  companyEmail: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  reportsTo: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
};
