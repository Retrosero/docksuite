export type HrOnboardingStatusTone = "neutral" | "warning" | "positive" | "negative";

export type HrOnboardingItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  status: string;
  statusTone: HrOnboardingStatusTone;
  startDate: string | null;
  joinDate: string | null;
  department: string;
  designation: string;
  updatedAt: string | null;
  documentCount: number;
  openZimmetCount: number;
  riskNotes: string[];
};

export type HrOnboardingStatusSummaryItem = {
  key: string;
  label: string;
  count: number;
};

export type HrOnboardingSummary = {
  totalRecords: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  joiningSoonCount: number;
  documentRiskCount: number;
  assetRiskCount: number;
};

export type HrOnboardingData = {
  items: HrOnboardingItem[];
  statusSummary: HrOnboardingStatusSummaryItem[];
  summary: HrOnboardingSummary;
};
