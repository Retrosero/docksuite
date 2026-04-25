export type HrRecruitmentOpeningItem = {
  id: string;
  title: string;
  status: string;
  department: string;
  designation: string;
  publishedOn: string | null;
  closingDate: string | null;
  applicantCount: number;
};

export type HrRecruitmentApplicantItem = {
  id: string;
  fullName: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  email: string;
  jobOpeningId: string;
  jobOpeningTitle: string;
  source: string;
  appliedOn: string | null;
};

export type HrRecruitmentStageSummaryItem = {
  key: string;
  label: string;
  count: number;
};

export type HrRecruitmentSummary = {
  totalOpenings: number;
  openOpenings: number;
  totalApplicants: number;
  recentApplicants: number;
};

export type HrRecruitmentData = {
  openings: HrRecruitmentOpeningItem[];
  applicants: HrRecruitmentApplicantItem[];
  stageSummary: HrRecruitmentStageSummaryItem[];
  summary: HrRecruitmentSummary;
};
