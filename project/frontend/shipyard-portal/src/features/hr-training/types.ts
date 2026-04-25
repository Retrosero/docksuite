export type HrTrainingEventItem = {
  id: string;
  title: string;
  programName: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

export type HrTrainingResultItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  eventId: string;
  resultLabel: string;
  resultTone: "neutral" | "warning" | "positive" | "negative";
  scoreLabel: string;
  updatedAt: string | null;
};

export type HrCertificateRiskItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType: string;
  status: string;
  expiryDate: string | null;
};

export type HrTrainingSummary = {
  totalPrograms: number;
  totalEvents: number;
  totalResults: number;
  totalFeedback: number;
  certificateCount: number;
  expiringCertificateCount: number;
};

export type HrTrainingData = {
  events: HrTrainingEventItem[];
  results: HrTrainingResultItem[];
  certificateRisks: HrCertificateRiskItem[];
  summary: HrTrainingSummary;
};
