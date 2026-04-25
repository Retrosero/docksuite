import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrRecruitmentApplicantItem,
  HrRecruitmentData,
  HrRecruitmentOpeningItem,
  HrRecruitmentStageSummaryItem
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  orderBy?: string;
  limit?: number;
};

type JobOpeningRow = {
  name?: string;
  job_title?: string;
  status?: string;
  department?: string;
  designation?: string;
  published_on?: string;
  closing_date?: string;
  modified?: string;
};

type JobApplicantRow = {
  name?: string;
  applicant_name?: string;
  status?: string;
  email_id?: string;
  job_opening?: string;
  source?: string;
  creation?: string;
  modified?: string;
};

const REQUEST_TIMEOUT_MS = 9000;
const RECENT_APPLICANT_WINDOW_DAYS = 7;

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 200));

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const payload = await requestErpJson<FrappeListResponse<T>>(`/resource/${encodeURIComponent(doctype)}`, params, {
    timeoutMs: REQUEST_TIMEOUT_MS
  });

  return payload.data ?? [];
}

function isFieldNotPermittedInQuery(error: unknown, fieldName: string) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes(`field not permitted in query: ${fieldName.toLowerCase()}`);
}

async function fetchJobOpenings(): Promise<JobOpeningRow[]> {
  const attempts: Array<{ fields: string[]; orderBy: string }> = [
    {
      fields: ["name", "job_title", "status", "department", "designation", "published_on", "closing_date", "modified"],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "job_title", "status", "department", "designation", "closing_date", "modified"],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "job_title", "status", "modified"],
      orderBy: "modified desc"
    }
  ];

  for (const attempt of attempts) {
    try {
      return await requestResourceList<JobOpeningRow>("Job Opening", {
        fields: attempt.fields,
        orderBy: attempt.orderBy,
        limit: 100
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "published_on") || isFieldNotPermittedInQuery(error, "department")) {
        continue;
      }
      continue;
    }
  }

  return [];
}

async function fetchJobApplicants(): Promise<JobApplicantRow[]> {
  const attempts: Array<{ fields: string[]; orderBy: string }> = [
    {
      fields: ["name", "applicant_name", "status", "email_id", "job_opening", "source", "creation", "modified"],
      orderBy: "modified desc"
    },
    {
      fields: ["name", "applicant_name", "status", "email_id", "job_opening", "creation"],
      orderBy: "creation desc"
    },
    {
      fields: ["name", "applicant_name", "status", "job_opening", "creation"],
      orderBy: "creation desc"
    }
  ];

  for (const attempt of attempts) {
    try {
      return await requestResourceList<JobApplicantRow>("Job Applicant", {
        fields: attempt.fields,
        orderBy: attempt.orderBy,
        limit: 400
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "email_id") || isFieldNotPermittedInQuery(error, "source")) {
        continue;
      }
      continue;
    }
  }

  return [];
}

function normalizeStatus(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toOpeningStatusLabel(value: string | undefined) {
  const normalized = normalizeStatus(value);
  if (normalized === "open") return "Acik";
  if (normalized === "closed") return "Kapali";
  if (normalized === "published") return "Yayinda";
  return value?.trim() || "Belirsiz";
}

function classifyApplicantStage(value: string | undefined) {
  const normalized = normalizeStatus(value);
  if (normalized.includes("screen")) return { key: "screening", label: "On Eleme", tone: "warning" as const };
  if (normalized.includes("interview")) return { key: "interview", label: "Mulakat", tone: "warning" as const };
  if (normalized.includes("offer")) return { key: "offer", label: "Teklif", tone: "warning" as const };
  if (normalized.includes("hired") || normalized.includes("accepted")) {
    return { key: "hired", label: "Ise Alindi", tone: "positive" as const };
  }
  if (normalized.includes("reject")) return { key: "rejected", label: "Reddedildi", tone: "negative" as const };
  if (normalized.includes("open") || normalized.includes("new") || normalized.includes("applied")) {
    return { key: "applied", label: "Basvuru", tone: "neutral" as const };
  }
  return { key: "other", label: "Diger", tone: "neutral" as const };
}

function isRecentApplicant(appliedOn: string | null) {
  if (!appliedOn) {
    return false;
  }
  const parsed = new Date(appliedOn);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const diffMs = Date.now() - parsed.getTime();
  return diffMs >= 0 && diffMs <= RECENT_APPLICANT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function buildStageSummary(applicants: HrRecruitmentApplicantItem[]): HrRecruitmentStageSummaryItem[] {
  const map = new Map<string, HrRecruitmentStageSummaryItem>();

  for (const applicant of applicants) {
    const stage = classifyApplicantStage(applicant.status);
    const current = map.get(stage.key);
    if (current) {
      current.count += 1;
      continue;
    }
    map.set(stage.key, { key: stage.key, label: stage.label, count: 1 });
  }

  const preferredOrder = ["applied", "screening", "interview", "offer", "hired", "rejected", "other"];
  return [...map.values()].sort((left, right) => preferredOrder.indexOf(left.key) - preferredOrder.indexOf(right.key));
}

export async function fetchHrRecruitmentData(): Promise<HrRecruitmentData> {
  const [canReadOpenings, canReadApplicants] = await Promise.all([
    canReadDoctype("Job Opening"),
    canReadDoctype("Job Applicant")
  ]);

  const [openingRows, applicantRows] = await Promise.all([
    canReadOpenings ? fetchJobOpenings() : Promise.resolve([]),
    canReadApplicants ? fetchJobApplicants() : Promise.resolve([])
  ]);

  const applicantCountByOpening = new Map<string, number>();
  for (const row of applicantRows) {
    const openingId = row.job_opening?.trim() || "";
    if (!openingId) {
      continue;
    }
    applicantCountByOpening.set(openingId, (applicantCountByOpening.get(openingId) ?? 0) + 1);
  }

  const openings: HrRecruitmentOpeningItem[] = openingRows.map((row) => ({
    id: row.name ?? "-",
    title: row.job_title?.trim() || row.name || "Pozisyon",
    status: toOpeningStatusLabel(row.status),
    department: row.department?.trim() || "-",
    designation: row.designation?.trim() || "-",
    publishedOn: row.published_on ?? null,
    closingDate: row.closing_date ?? null,
    applicantCount: applicantCountByOpening.get(row.name?.trim() || "") ?? 0
  }));

  const openingTitleById = new Map(openings.map((item) => [item.id, item.title] as const));

  const applicants: HrRecruitmentApplicantItem[] = applicantRows.map((row) => {
    const stage = classifyApplicantStage(row.status);
    const openingId = row.job_opening?.trim() || "-";
    return {
      id: row.name ?? "-",
      fullName: row.applicant_name?.trim() || "Aday",
      status: stage.label,
      statusTone: stage.tone,
      email: row.email_id?.trim() || "-",
      jobOpeningId: openingId,
      jobOpeningTitle: openingTitleById.get(openingId) ?? openingId,
      source: row.source?.trim() || "Belirtilmedi",
      appliedOn: row.creation ?? row.modified ?? null
    };
  });

  const openOpenings = openings.filter((opening) => normalizeStatus(opening.status).includes("acik")).length;
  const recentApplicants = applicants.filter((applicant) => isRecentApplicant(applicant.appliedOn)).length;

  return {
    openings,
    applicants,
    stageSummary: buildStageSummary(applicants),
    summary: {
      totalOpenings: openings.length,
      openOpenings,
      totalApplicants: applicants.length,
      recentApplicants
    }
  };
}
