import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrComplianceData,
  HrDocumentComplianceRiskItem,
  HrHealthInsuranceRiskItem,
  HrMissingComplianceItem
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

type HealthInsuranceRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  insurance_company?: string;
  policy_no?: string;
  start_date?: string;
  end_date?: string;
  valid_from?: string;
  valid_till?: string;
  status?: string;
};

type DocumentRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  document_type?: string;
  status?: string;
  expiry_date?: string;
  is_required?: number | 0 | 1;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  department?: string;
  designation?: string;
  status?: string;
  employee_status?: string;
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

function isExpiredDate(value: string | null) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() < Date.now();
}

function isExpiringSoon(value: string | null) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const threshold = Date.now() + 1000 * 60 * 60 * 24 * 45;
  return date.getTime() <= threshold;
}

function employeeIsActive(row: EmployeeRow) {
  const key = normalize(row.status ?? row.employee_status);
  if (!key) {
    return true;
  }
  return key === "active";
}

async function fetchHealthInsurances(): Promise<HealthInsuranceRow[]> {
  const attempts: string[][] = [
    [
      "name",
      "employee",
      "employee_name",
      "insurance_company",
      "policy_no",
      "start_date",
      "end_date",
      "status"
    ],
    [
      "name",
      "employee",
      "employee_name",
      "insurance_company",
      "policy_no",
      "valid_from",
      "valid_till",
      "status"
    ],
    ["name", "employee", "employee_name", "insurance_company", "policy_no", "status"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<HealthInsuranceRow>("Employee Health Insurance", {
        fields,
        orderBy: "modified desc",
        limit: 1000
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "employee_name") ||
        isFieldNotPermittedInQuery(error, "start_date") ||
        isFieldNotPermittedInQuery(error, "valid_from")
      ) {
        continue;
      }
    }
  }

  return [];
}

async function fetchEmployees(): Promise<EmployeeRow[]> {
  const attempts: string[][] = [
    ["name", "employee_name", "department", "designation", "status", "employee_status"],
    ["name", "employee_name", "department", "designation", "status"],
    ["name", "employee_name", "department", "designation"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<EmployeeRow>("Employee", {
        fields,
        orderBy: "modified desc",
        limit: 2000
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_status")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchDocumentRisks(): Promise<DocumentRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "document_type", "status", "expiry_date", "is_required"],
    ["name", "employee", "employee_name", "document_type", "status", "expiry_date"],
    ["name", "employee", "document_type", "status", "expiry_date"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<DocumentRow>("Employee Document Record", {
        fields,
        orderBy: "modified desc",
        limit: 2000
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "employee_name") ||
        isFieldNotPermittedInQuery(error, "is_required")
      ) {
        continue;
      }
    }
  }

  return [];
}

function mapHealthInsuranceRiskRows(rows: HealthInsuranceRow[]): HrHealthInsuranceRiskItem[] {
  return rows.map((row) => {
    const validFrom = row.start_date ?? row.valid_from ?? null;
    const validTo = row.end_date ?? row.valid_till ?? null;
    const statusKey = normalize(row.status);

    let status = row.status?.trim() || "Belirsiz";
    let statusTone: HrHealthInsuranceRiskItem["statusTone"] = "neutral";

    if (statusKey === "expired" || isExpiredDate(validTo)) {
      status = "Suresi Doldu";
      statusTone = "negative";
    } else if (statusKey === "expiring soon" || isExpiringSoon(validTo)) {
      status = "Yaklasiyor";
      statusTone = "warning";
    } else if (statusKey.includes("active") || statusKey.includes("valid")) {
      status = "Gecerli";
      statusTone = "positive";
    }

    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      provider: row.insurance_company?.trim() || "-",
      policyNumber: row.policy_no?.trim() || "-",
      validFrom,
      validTo,
      status,
      statusTone
    };
  });
}

function mapDocumentRiskRows(rows: DocumentRow[]): HrDocumentComplianceRiskItem[] {
  return rows
    .filter((row) => {
      const status = normalize(row.status);
      const expiryDate = row.expiry_date ?? null;
      const requiredFlag = row.is_required === 1 || row.is_required === 0 ? row.is_required : null;
      if (requiredFlag === 0) {
        return false;
      }
      return status === "expired" || status === "expiring soon" || isExpiredDate(expiryDate) || isExpiringSoon(expiryDate);
    })
    .map((row) => ({
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      documentType: row.document_type?.trim() || "Belge",
      status: normalize(row.status) === "expired" || isExpiredDate(row.expiry_date ?? null) ? "Suresi Doldu" : "Yaklasiyor",
      expiryDate: row.expiry_date ?? null
    }));
}

export async function fetchHrComplianceData(): Promise<HrComplianceData> {
  const [canReadHealthInsurance, canReadEmployee, canReadDocumentRecord] = await Promise.all([
    canReadDoctype("Employee Health Insurance"),
    canReadDoctype("Employee"),
    canReadDoctype("Employee Document Record")
  ]);

  const [healthInsuranceRows, employeeRows, documentRows] = await Promise.all([
    canReadHealthInsurance ? fetchHealthInsurances() : Promise.resolve([]),
    canReadEmployee ? fetchEmployees() : Promise.resolve([]),
    canReadDocumentRecord ? fetchDocumentRisks() : Promise.resolve([])
  ]);

  const healthInsurances = mapHealthInsuranceRiskRows(healthInsuranceRows);
  const healthInsuranceRisks = healthInsurances.filter((item) => item.statusTone !== "positive");
  const documentRisks = mapDocumentRiskRows(documentRows);

  const activeEmployees = employeeRows.filter((row) => employeeIsActive(row));
  const insuredEmployeeIds = new Set(healthInsurances.map((item) => item.employeeId));
  const missingCoverageEmployees: HrMissingComplianceItem[] = activeEmployees
    .filter((row) => {
      const id = row.name ?? "-";
      return id !== "-" && !insuredEmployeeIds.has(id);
    })
    .map((row) => ({
      employeeId: row.name ?? "-",
      employeeName: row.employee_name?.trim() || row.name || "-",
      department: row.department?.trim() || "-",
      designation: row.designation?.trim() || "-",
      reason: "Saglik sigortasi kaydi bulunmuyor"
    }));

  return {
    healthInsuranceRisks: healthInsuranceRisks.slice(0, 40),
    documentRisks: documentRisks.slice(0, 40),
    missingCoverageEmployees: missingCoverageEmployees.slice(0, 40),
    summary: {
      totalHealthInsuranceCount: healthInsurances.length,
      healthInsuranceRiskCount: healthInsuranceRisks.length,
      documentRiskCount: documentRisks.length,
      missingHealthInsuranceEmployeeCount: missingCoverageEmployees.length
    }
  };
}
