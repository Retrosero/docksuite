export type HrGoalItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  subject: string;
  progressLabel: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  updatedAt: string | null;
};

export type HrAppraisalCycleItem = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

export type HrAppraisalItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  cycleName: string;
  scoreLabel: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  updatedAt: string | null;
};

export type HrPerformanceFeedbackItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  referenceLabel: string;
  feedbackSnippet: string;
  updatedAt: string | null;
};

export type HrPerformanceSummary = {
  totalGoalCount: number;
  totalCycleCount: number;
  totalAppraisalCount: number;
  totalFeedbackCount: number;
  pendingGoalCount: number;
  pendingAppraisalCount: number;
};

export type HrPerformanceData = {
  goals: HrGoalItem[];
  cycles: HrAppraisalCycleItem[];
  appraisals: HrAppraisalItem[];
  feedbacks: HrPerformanceFeedbackItem[];
  summary: HrPerformanceSummary;
};
