import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrCertificateRiskItem,
  HrTrainingData,
  HrTrainingEventItem,
  HrTrainingResultItem
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

type TrainingProgramRow = {
  name?: string;
  training_program_name?: string;
};

type TrainingEventRow = {
  name?: string;
  event_name?: string;
  training_program?: string;
  starts_on?: string;
  ends_on?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  modified?: string;
};

type TrainingResultRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  training_event?: string;
  result?: string;
  score?: number;
  modified?: string;
};

type TrainingFeedbackRow = {
  name?: string;
};

type DocumentRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  document_type?: string;
  status?: string;
  expiry_date?: string;
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

async function fetchTrainingPrograms(): Promise<TrainingProgramRow[]> {
  const attempts: string[][] = [["name", "training_program_name"], ["name"]];

  for (const fields of attempts) {
    try {
      return await requestResourceList<TrainingProgramRow>("Training Program", {
        fields,
        orderBy: "modified desc",
        limit: 200
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "training_program_name")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchTrainingEvents(): Promise<TrainingEventRow[]> {
  const attempts: string[][] = [
    ["name", "event_name", "training_program", "starts_on", "ends_on", "status", "modified"],
    ["name", "event_name", "training_program", "start_date", "end_date", "status", "modified"],
    ["name", "event_name", "training_program", "status", "modified"],
    ["name", "training_program", "status", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<TrainingEventRow>("Training Event", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "starts_on") ||
        isFieldNotPermittedInQuery(error, "start_date") ||
        isFieldNotPermittedInQuery(error, "event_name")
      ) {
        continue;
      }
    }
  }

  return [];
}

async function fetchTrainingResults(): Promise<TrainingResultRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "training_event", "result", "score", "modified"],
    ["name", "employee", "employee_name", "training_event", "result", "modified"],
    ["name", "employee", "training_event", "result", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<TrainingResultRow>("Training Result", {
        fields,
        orderBy: "modified desc",
        limit: 500
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "score") || isFieldNotPermittedInQuery(error, "employee_name")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchTrainingFeedbackCount(): Promise<number> {
  const canRead = await canReadDoctype("Training Feedback");
  if (!canRead) {
    return 0;
  }

  try {
    const rows = await requestResourceList<TrainingFeedbackRow>("Training Feedback", {
      fields: ["name"],
      orderBy: "modified desc",
      limit: 1000
    });
    return rows.length;
  } catch {
    return 0;
  }
}

function toResultMeta(value: string | undefined) {
  const normalized = normalize(value);
  if (normalized.includes("pass") || normalized.includes("success") || normalized.includes("basar")) {
    return { label: "Basarili", tone: "positive" as const };
  }
  if (normalized.includes("fail") || normalized.includes("unsuccess") || normalized.includes("basaris")) {
    return { label: "Basarisiz", tone: "negative" as const };
  }
  if (normalized.includes("pending") || normalized.includes("bekle")) {
    return { label: "Beklemede", tone: "warning" as const };
  }
  return { label: value?.trim() || "Belirsiz", tone: "neutral" as const };
}

function isCertificateDocument(value: string | undefined) {
  const normalized = normalize(value);
  return normalized.includes("sertifika") || normalized.includes("certificate");
}

function isCertificateRiskStatus(value: string | undefined) {
  const normalized = normalize(value);
  return normalized === "expired" || normalized === "expiring soon";
}

async function fetchCertificateRisks(): Promise<HrCertificateRiskItem[]> {
  const canReadDocumentRecord = await canReadDoctype("Employee Document Record");
  if (!canReadDocumentRecord) {
    return [];
  }

  let rows: DocumentRow[] = [];
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "document_type", "status", "expiry_date"],
    ["name", "employee", "document_type", "status", "expiry_date"]
  ];

  for (const fields of attempts) {
    try {
      rows = await requestResourceList<DocumentRow>("Employee Document Record", {
        fields,
        orderBy: "modified desc",
        limit: 2000
      });
      break;
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name")) {
        continue;
      }
    }
  }

  return rows
    .filter((row) => isCertificateDocument(row.document_type))
    .filter((row) => isCertificateRiskStatus(row.status))
    .map((row) => ({
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      documentType: row.document_type?.trim() || "Sertifika",
      status: normalize(row.status) === "expired" ? "Suresi Doldu" : "Yaklasiyor",
      expiryDate: row.expiry_date ?? null
    }))
    .slice(0, 40);
}

export async function fetchHrTrainingData(): Promise<HrTrainingData> {
  const [canReadProgram, canReadEvent, canReadResult] = await Promise.all([
    canReadDoctype("Training Program"),
    canReadDoctype("Training Event"),
    canReadDoctype("Training Result")
  ]);

  const [programRows, eventRows, resultRows, feedbackCount, certificateRisks] = await Promise.all([
    canReadProgram ? fetchTrainingPrograms() : Promise.resolve([]),
    canReadEvent ? fetchTrainingEvents() : Promise.resolve([]),
    canReadResult ? fetchTrainingResults() : Promise.resolve([]),
    fetchTrainingFeedbackCount(),
    fetchCertificateRisks()
  ]);

  const programNameById = new Map(
    programRows.map((row) => [row.name ?? "-", row.training_program_name?.trim() || row.name || "Program"] as const)
  );

  const events: HrTrainingEventItem[] = eventRows.map((row) => ({
    id: row.name ?? "-",
    title: row.event_name?.trim() || row.name || "Egitim Etkinligi",
    programName: programNameById.get(row.training_program ?? "") ?? row.training_program ?? "-",
    startDate: row.starts_on ?? row.start_date ?? null,
    endDate: row.ends_on ?? row.end_date ?? null,
    status: row.status?.trim() || "Belirsiz"
  }));

  const eventTitleById = new Map(events.map((item) => [item.id, item.title] as const));

  const results: HrTrainingResultItem[] = resultRows.map((row) => {
    const resultMeta = toResultMeta(row.result);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      eventId: eventTitleById.get(row.training_event ?? "") ?? row.training_event ?? "-",
      resultLabel: resultMeta.label,
      resultTone: resultMeta.tone,
      scoreLabel: typeof row.score === "number" ? row.score.toFixed(1) : "-",
      updatedAt: row.modified ?? null
    };
  });

  return {
    events: events.slice(0, 40),
    results: results.slice(0, 40),
    certificateRisks,
    summary: {
      totalPrograms: programRows.length,
      totalEvents: eventRows.length,
      totalResults: resultRows.length,
      totalFeedback: feedbackCount,
      certificateCount: certificateRisks.length,
      expiringCertificateCount: certificateRisks.filter((item) => item.status === "Yaklasiyor").length
    }
  };
}
