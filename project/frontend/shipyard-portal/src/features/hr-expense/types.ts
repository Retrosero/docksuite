export type HrAdvanceItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  amountLabel: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  postingDate: string | null;
  updatedAt: string | null;
};

export type HrExpenseClaimItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  claimAmountLabel: string;
  sanctionedAmountLabel: string;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  postingDate: string | null;
  updatedAt: string | null;
};

export type HrTravelRequestItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  fromDate: string | null;
  toDate: string | null;
  status: string;
  statusTone: "neutral" | "warning" | "positive" | "negative";
  updatedAt: string | null;
};

export type HrExpenseSummary = {
  totalAdvanceCount: number;
  totalExpenseClaimCount: number;
  totalTravelRequestCount: number;
  pendingAdvanceCount: number;
  pendingExpenseClaimCount: number;
  pendingTravelRequestCount: number;
};

export type HrExpenseData = {
  advances: HrAdvanceItem[];
  expenseClaims: HrExpenseClaimItem[];
  travelRequests: HrTravelRequestItem[];
  summary: HrExpenseSummary;
};
