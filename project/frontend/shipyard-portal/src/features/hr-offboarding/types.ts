export type HrOffboardingStatusTone = "neutral" | "warning" | "positive" | "negative";

export type HrOffboardingItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  status: string;
  statusTone: HrOffboardingStatusTone;
  separationDate: string | null;
  relievingDate: string | null;
  department: string;
  designation: string;
  updatedAt: string | null;
  interviewCount: number;
  finalSettlementCount: number;
  openZimmetCount: number;
  riskNotes: string[];
};

export type HrOffboardingStatusSummaryItem = {
  key: string;
  label: string;
  count: number;
};

export type HrOffboardingSummary = {
  totalRecords: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  openAssetRiskCount: number;
  missingInterviewCount: number;
  missingFinalSettlementCount: number;
};

export type HrOffboardingData = {
  items: HrOffboardingItem[];
  statusSummary: HrOffboardingStatusSummaryItem[];
  summary: HrOffboardingSummary;
};
