export type HrBenefitApplicationItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitType: string;
  payrollPeriod: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  updatedAt: string | null;
};

export type HrBenefitClaimItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitType: string;
  claimAmountLabel: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  postingDate: string | null;
  updatedAt: string | null;
};

export type HrAdditionalSalaryItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryComponent: string;
  amountLabel: string;
  payrollDate: string | null;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  updatedAt: string | null;
};

export type HrBenefitsSummary = {
  totalBenefitApplicationCount: number;
  totalBenefitClaimCount: number;
  totalAdditionalSalaryCount: number;
  pendingBenefitApplicationCount: number;
  pendingBenefitClaimCount: number;
  pendingAdditionalSalaryCount: number;
};

export type HrBenefitsData = {
  benefitApplications: HrBenefitApplicationItem[];
  benefitClaims: HrBenefitClaimItem[];
  additionalSalaries: HrAdditionalSalaryItem[];
  summary: HrBenefitsSummary;
};
