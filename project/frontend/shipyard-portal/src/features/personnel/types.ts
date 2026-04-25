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

export type PersonnelDocumentSummaryType = {
  totalDocuments: number;
  missingCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  checklist: PersonnelDocumentChecklistItemType[];
  recentDocuments: PersonnelDocumentItemType[];
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
