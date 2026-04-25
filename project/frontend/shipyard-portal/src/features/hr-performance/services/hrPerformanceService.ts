import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrAppraisalCycleItem,
  HrAppraisalItem,
  HrGoalItem,
  HrPerformanceData,
  HrPerformanceFeedbackItem
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type GoalRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  subject?: string;
  progress?: number;
  status?: string;
  docstatus?: number;
  modified?: string;
};

type AppraisalCycleRow = {
  name?: string;
  appraisal_cycle_name?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  modified?: string;
};

type AppraisalRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  appraisal_cycle?: string;
  total_score?: number;
  final_score?: number;
  rating?: number;
  status?: string;
  docstatus?: number;
  modified?: string;
};

type PerformanceFeedbackRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  appraisal?: string;
  feedback?: string;
  comments?: string;
  modified?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 300));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const payload = await requestErpJson<FrappeListResponse<T>>(`/resource/${encodeURIComponent(doctype)}`, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });

  return payload.data ?? [];
}

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

function toStatusMeta(rawStatus: string | undefined, docstatus: number | undefined) {
  const status = rawStatus?.trim() || (docstatus === 1 ? "Submitted" : docstatus === 2 ? "Cancelled" : "Draft");
  const key = normalize(status);

  if (key.includes("completed") || key.includes("closed") || key.includes("final")) {
    return { label: status, tone: "positive" as const };
  }

  if (key.includes("rejected") || key.includes("cancel")) {
    return { label: status, tone: "negative" as const };
  }

  if (key.includes("draft") || key.includes("pending") || key.includes("open") || key.includes("in progress")) {
    return { label: status, tone: "warning" as const };
  }

  return { label: status, tone: "neutral" as const };
}

function isPendingStatus(status: string) {
  const key = normalize(status);
  if (key.includes("completed") || key.includes("closed") || key.includes("final")) {
    return false;
  }
  if (key.includes("rejected") || key.includes("cancel")) {
    return false;
  }
  return true;
}

async function fetchGoals(): Promise<GoalRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "subject", "progress", "status", "docstatus", "modified"],
    ["name", "employee", "subject", "progress", "status", "docstatus", "modified"],
    ["name", "employee", "status", "docstatus", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<GoalRow>("Goal", {
        fields,
        orderBy: "modified desc",
        limit: 400
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "subject")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchAppraisalCycles(): Promise<AppraisalCycleRow[]> {
  const attempts: string[][] = [
    ["name", "appraisal_cycle_name", "start_date", "end_date", "status", "modified"],
    ["name", "title", "start_date", "end_date", "status", "modified"],
    ["name", "start_date", "end_date", "status", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<AppraisalCycleRow>("Appraisal Cycle", {
        fields,
        orderBy: "modified desc",
        limit: 200
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "appraisal_cycle_name") || isFieldNotPermittedInQuery(error, "title")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchAppraisals(): Promise<AppraisalRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "appraisal_cycle", "total_score", "final_score", "rating", "status", "docstatus", "modified"],
    ["name", "employee", "employee_name", "appraisal_cycle", "rating", "status", "docstatus", "modified"],
    ["name", "employee", "appraisal_cycle", "status", "docstatus", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<AppraisalRow>("Appraisal", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "employee_name") ||
        isFieldNotPermittedInQuery(error, "total_score") ||
        isFieldNotPermittedInQuery(error, "final_score")
      ) {
        continue;
      }
    }
  }

  return [];
}

async function fetchPerformanceFeedbacks(): Promise<PerformanceFeedbackRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "appraisal", "feedback", "comments", "modified"],
    ["name", "employee", "employee_name", "appraisal", "comments", "modified"],
    ["name", "employee", "appraisal", "comments", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<PerformanceFeedbackRow>("Employee Performance Feedback", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "employee_name") ||
        isFieldNotPermittedInQuery(error, "feedback") ||
        isFieldNotPermittedInQuery(error, "comments")
      ) {
        continue;
      }
    }
  }

  return [];
}

function toFeedbackSnippet(value: string | undefined) {
  const text = value?.trim() || "";
  if (!text) {
    return "Geri bildirim notu girilmemis.";
  }
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
}

function toScoreLabel(row: AppraisalRow) {
  if (typeof row.final_score === "number") {
    return row.final_score.toFixed(1);
  }
  if (typeof row.total_score === "number") {
    return row.total_score.toFixed(1);
  }
  if (typeof row.rating === "number") {
    return row.rating.toFixed(1);
  }
  return "-";
}

export async function fetchHrPerformanceData(): Promise<HrPerformanceData> {
  const [canReadGoal, canReadCycle, canReadAppraisal, canReadFeedback] = await Promise.all([
    canReadDoctype("Goal"),
    canReadDoctype("Appraisal Cycle"),
    canReadDoctype("Appraisal"),
    canReadDoctype("Employee Performance Feedback")
  ]);

  const [goalRows, cycleRows, appraisalRows, feedbackRows] = await Promise.all([
    canReadGoal ? fetchGoals() : Promise.resolve([]),
    canReadCycle ? fetchAppraisalCycles() : Promise.resolve([]),
    canReadAppraisal ? fetchAppraisals() : Promise.resolve([]),
    canReadFeedback ? fetchPerformanceFeedbacks() : Promise.resolve([])
  ]);

  const cycleNameById = new Map(
    cycleRows.map((row) => [row.name ?? "-", row.appraisal_cycle_name?.trim() || row.title?.trim() || row.name || "-"] as const)
  );

  const goals: HrGoalItem[] = goalRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      subject: row.subject?.trim() || "Hedef",
      progressLabel: typeof row.progress === "number" ? `%${Math.round(row.progress)}` : "-",
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      updatedAt: row.modified ?? null
    };
  });

  const cycles: HrAppraisalCycleItem[] = cycleRows.map((row) => ({
    id: row.name ?? "-",
    title: row.appraisal_cycle_name?.trim() || row.title?.trim() || row.name || "Donem",
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    status: row.status?.trim() || "Belirsiz"
  }));

  const appraisals: HrAppraisalItem[] = appraisalRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      cycleName: cycleNameById.get(row.appraisal_cycle ?? "") ?? row.appraisal_cycle ?? "-",
      scoreLabel: toScoreLabel(row),
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      updatedAt: row.modified ?? null
    };
  });

  const feedbacks: HrPerformanceFeedbackItem[] = feedbackRows.map((row) => ({
    id: row.name ?? "-",
    employeeId: row.employee ?? "-",
    employeeName: row.employee_name?.trim() || row.employee || "-",
    referenceLabel: row.appraisal?.trim() || "-",
    feedbackSnippet: toFeedbackSnippet(row.feedback ?? row.comments),
    updatedAt: row.modified ?? null
  }));

  return {
    goals: goals.slice(0, 40),
    cycles: cycles.slice(0, 20),
    appraisals: appraisals.slice(0, 40),
    feedbacks: feedbacks.slice(0, 40),
    summary: {
      totalGoalCount: goals.length,
      totalCycleCount: cycles.length,
      totalAppraisalCount: appraisals.length,
      totalFeedbackCount: feedbacks.length,
      pendingGoalCount: goals.filter((item) => isPendingStatus(item.status)).length,
      pendingAppraisalCount: appraisals.filter((item) => isPendingStatus(item.status)).length
    }
  };
}
