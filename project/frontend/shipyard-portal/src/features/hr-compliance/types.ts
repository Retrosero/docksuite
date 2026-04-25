export type HrHealthInsuranceRiskItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  provider: string;
  policyNumber: string;
  validFrom: string | null;
  validTo: string | null;
  status: string;
  statusTone: "neutral" | "warning" | "negative" | "positive";
};

export type HrDocumentComplianceRiskItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType: string;
  status: string;
  expiryDate: string | null;
};

export type HrMissingComplianceItem = {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  reason: string;
};

export type HrComplianceSummary = {
  totalHealthInsuranceCount: number;
  healthInsuranceRiskCount: number;
  documentRiskCount: number;
  missingHealthInsuranceEmployeeCount: number;
};

export type HrComplianceData = {
  healthInsuranceRisks: HrHealthInsuranceRiskItem[];
  documentRisks: HrDocumentComplianceRiskItem[];
  missingCoverageEmployees: HrMissingComplianceItem[];
  summary: HrComplianceSummary;
};
