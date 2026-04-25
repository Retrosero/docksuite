import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrAdditionalSalaryItem,
  HrBenefitApplicationItem,
  HrBenefitClaimItem,
  HrBenefitsData
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

type BenefitApplicationRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  employee_benefit?: string;
  payroll_date?: string;
  status?: string;
  docstatus?: number;
  modified?: string;
};

type BenefitClaimRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  employee_benefit_application?: string;
  claimed_amount?: number;
  currency?: string;
  status?: string;
  docstatus?: number;
  posting_date?: string;
  modified?: string;
};

type AdditionalSalaryRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  salary_component?: string;
  amount?: number;
  currency?: string;
  payroll_date?: string;
  status?: string;
  docstatus?: number;
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

function toMoneyLabel(amount: number | undefined, currency: string | undefined) {
  const parsed = typeof amount === "number" ? amount : 0;
  const unit = currency?.trim() || "TRY";
  return `${parsed.toFixed(2)} ${unit}`;
}

function toStatusMeta(rawStatus: string | undefined, docstatus: number | undefined) {
  const status = rawStatus?.trim() || (docstatus === 1 ? "Submitted" : docstatus === 2 ? "Cancelled" : "Draft");
  const key = normalize(status);

  if (key.includes("approved") || key.includes("booked") || key.includes("paid") || key.includes("accepted")) {
    return { label: status, tone: "positive" as const };
  }

  if (key.includes("rejected") || key.includes("cancel")) {
    return { label: status, tone: "negative" as const };
  }

  if (key.includes("draft") || key.includes("pending") || key.includes("requested")) {
    return { label: status, tone: "warning" as const };
  }

  return { label: status, tone: "neutral" as const };
}

function isPendingStatus(status: string) {
  const key = normalize(status);
  if (key.includes("approved") || key.includes("booked") || key.includes("paid") || key.includes("accepted")) {
    return false;
  }
  if (key.includes("rejected") || key.includes("cancel")) {
    return false;
  }
  return true;
}

async function fetchBenefitApplications(): Promise<BenefitApplicationRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "employee_benefit", "payroll_date", "status", "docstatus", "modified"],
    ["name", "employee", "employee_benefit", "payroll_date", "status", "docstatus", "modified"],
    ["name", "employee", "payroll_date", "status", "docstatus", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<BenefitApplicationRow>("Employee Benefit Application", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "employee_benefit")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchBenefitClaims(): Promise<BenefitClaimRow[]> {
  const attempts: string[][] = [
    [
      "name",
      "employee",
      "employee_name",
      "employee_benefit_application",
      "claimed_amount",
      "currency",
      "status",
      "docstatus",
      "posting_date",
      "modified"
    ],
    ["name", "employee", "employee_benefit_application", "claimed_amount", "currency", "status", "docstatus", "posting_date", "modified"],
    ["name", "employee", "claimed_amount", "currency", "status", "docstatus", "posting_date", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<BenefitClaimRow>("Employee Benefit Claim", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "employee_benefit_application")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchAdditionalSalaries(): Promise<AdditionalSalaryRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "salary_component", "amount", "currency", "payroll_date", "status", "docstatus", "modified"],
    ["name", "employee", "salary_component", "amount", "currency", "payroll_date", "status", "docstatus", "modified"],
    ["name", "employee", "amount", "currency", "payroll_date", "status", "docstatus", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<AdditionalSalaryRow>("Additional Salary", {
        fields,
        orderBy: "modified desc",
        limit: 300
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "employee_name") || isFieldNotPermittedInQuery(error, "salary_component")) {
        continue;
      }
    }
  }

  return [];
}

export async function fetchHrBenefitsData(): Promise<HrBenefitsData> {
  const [canReadBenefitApp, canReadBenefitClaim, canReadAdditionalSalary] = await Promise.all([
    canReadDoctype("Employee Benefit Application"),
    canReadDoctype("Employee Benefit Claim"),
    canReadDoctype("Additional Salary")
  ]);

  const [benefitApplicationRows, benefitClaimRows, additionalSalaryRows] = await Promise.all([
    canReadBenefitApp ? fetchBenefitApplications() : Promise.resolve([]),
    canReadBenefitClaim ? fetchBenefitClaims() : Promise.resolve([]),
    canReadAdditionalSalary ? fetchAdditionalSalaries() : Promise.resolve([])
  ]);

  const benefitApplications: HrBenefitApplicationItem[] = benefitApplicationRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      benefitType: row.employee_benefit?.trim() || "Benefit Application",
      payrollPeriod: row.payroll_date ?? "-",
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      updatedAt: row.modified ?? null
    };
  });

  const benefitClaims: HrBenefitClaimItem[] = benefitClaimRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      benefitType: row.employee_benefit_application?.trim() || "Benefit Claim",
      claimAmountLabel: toMoneyLabel(row.claimed_amount, row.currency),
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      postingDate: row.posting_date ?? null,
      updatedAt: row.modified ?? null
    };
  });

  const additionalSalaries: HrAdditionalSalaryItem[] = additionalSalaryRows.map((row) => {
    const statusMeta = toStatusMeta(row.status, row.docstatus);
    return {
      id: row.name ?? "-",
      employeeId: row.employee ?? "-",
      employeeName: row.employee_name?.trim() || row.employee || "-",
      salaryComponent: row.salary_component?.trim() || "Additional Salary",
      amountLabel: toMoneyLabel(row.amount, row.currency),
      payrollDate: row.payroll_date ?? null,
      status: statusMeta.label,
      statusTone: statusMeta.tone,
      updatedAt: row.modified ?? null
    };
  });

  return {
    benefitApplications: benefitApplications.slice(0, 40),
    benefitClaims: benefitClaims.slice(0, 40),
    additionalSalaries: additionalSalaries.slice(0, 40),
    summary: {
      totalBenefitApplicationCount: benefitApplications.length,
      totalBenefitClaimCount: benefitClaims.length,
      totalAdditionalSalaryCount: additionalSalaries.length,
      pendingBenefitApplicationCount: benefitApplications.filter((item) => isPendingStatus(item.status)).length,
      pendingBenefitClaimCount: benefitClaims.filter((item) => isPendingStatus(item.status)).length,
      pendingAdditionalSalaryCount: additionalSalaries.filter((item) => isPendingStatus(item.status)).length
    }
  };
}
