// Maaş bilgisi
export type SalaryInfo = {
  name: string;
  employee: string;
  employee_name: string;
  baseSalary: number;
  currency: string;
  payGrade: string;
  effectiveFrom: string | null;
};

// Yan haklar
export type BenefitItem = {
  id: string;
  name: string;
  benefitName: string;
  type: "allowance" | "deduction";
  amount: number;
  isTaxable: boolean;
};

// Maaş özeti (bordro dönemi için)
export type SalarySummary = {
  employeeId: string;
  period: string;
  workingDays: number;
  actualHoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  baseSalary: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  benefits: BenefitItem[];
};

// Çalışma geçmişi
export type WorkHistoryItem = {
  id: string;
  date: string;
  checkin: string;
  checkout: string;
  hoursWorked: number;
  shiftType: string;
  status: string;
};

export type WorkHistorySummary = {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  avgHoursPerDay: number;
};

export type WorkHistory = {
  employeeId: string;
  period: string;
  items: WorkHistoryItem[];
  summary: WorkHistorySummary;
};

// İzin geçmişi
export type LeaveHistoryItem = {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: string;
  statusLabel: string;
};

export type LeaveHistorySummary = {
  totalApplications: number;
  approvedDays: number;
  pendingDays: number;
  rejectedDays: number;
};

export type LeaveHistory = {
  employeeId: string;
  items: LeaveHistoryItem[];
  summary: LeaveHistorySummary;
};

// Mesai geçmişi
export type OvertimeHistoryItem = {
  id: string;
  date: string;
  hours: number;
  reason: string;
  status: string;
  statusLabel: string;
};

export type OvertimeHistorySummary = {
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  rejectedHours: number;
  totalPay: number;
};

export type OvertimeHistory = {
  employeeId: string;
  items: OvertimeHistoryItem[];
  summary: OvertimeHistorySummary;
};

// Personel detay (maaş dahil)
export type PersonnelWithSalary = {
  id: string;
  fullName: string;
  status: string;
  designation: string;
  department: string;
  company: string;
  salaryInfo: SalaryInfo | null;
  benefits: BenefitItem[];
  workHistory: WorkHistory | null;
  leaveHistory: LeaveHistory | null;
  overtimeHistory: OvertimeHistory | null;
};

// Bordro dönemi
export type PayrollPeriod = {
  year: number;
  month: number;
  label: string;
  startDate: string;
  endDate: string;
};

// Bordro hesaplama sonucu
export type PayrollCalculation = {
  employeeId: string;
  period: PayrollPeriod;
  baseSalary: number;
  hourlyRate: number;
  regularHoursWorked: number;
  overtimeWeekdayHours: number;
  overtimeWeekendHours: number;
  overtimeWeekdayRate: number;
  overtimeWeekendRate: number;
  overtimeWeekdayPay: number;
  overtimeWeekendPay: number;
  totalOvertimePay: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  workDays: number;
  attendanceDays: number;
};
