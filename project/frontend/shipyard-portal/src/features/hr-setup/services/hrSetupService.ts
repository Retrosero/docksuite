import { BriefcaseBusiness, CalendarDays, CircleDollarSign, ShieldCheck, Users } from "lucide-react";
import { canReadDoctype, postErpDoc, requestErpJson } from "../../../lib/erpApi";
import type {
  HrSetupAlert,
  HrSetupData,
  HrSetupEmployeeQuality,
  HrSetupMasterDefinition,
  HrSetupMasterKey,
  HrSetupMasterRecord,
  HrSetupMasterState,
  HrSetupQuickCreateInput,
  HrSetupStep,
  HrSetupSummary
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type ResourceListOptions = {
  fields: string[];
  orderBy?: string;
  limit?: number;
};

type CompanyRow = {
  name?: string;
  company_name?: string;
  abbr?: string;
  default_currency?: string;
};

type BranchRow = {
  name?: string;
  branch?: string;
};

type DepartmentRow = {
  name?: string;
  department_name?: string;
  company?: string;
};

type DesignationRow = {
  name?: string;
  designation_name?: string;
};

type NamedRow = {
  name?: string;
  employee_type_name?: string;
  grade_name?: string;
  group_name?: string;
  leave_type_name?: string;
  holiday_list_name?: string;
  shift_type_name?: string;
  payroll_period_name?: string;
  from_date?: string;
  to_date?: string;
  is_active?: number;
  disabled?: number;
};

type EmployeeQualityRow = {
  name?: string;
  status?: string;
  department?: string;
  designation?: string;
  employment_type?: string;
};

const REQUEST_TIMEOUT_MS = 9000;

export const hrSetupMasterDefinitions: HrSetupMasterDefinition[] = [
  {
    key: "company",
    label: "Sirket",
    doctype: "Company",
    description: "Tenant icindeki yasal sirket kayitlari",
    category: "organization",
    canCreateQuickly: false
  },
  {
    key: "branch",
    label: "Sube",
    doctype: "Branch",
    description: "Lokasyon ve sube ayrimi",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "department",
    label: "Departman",
    doctype: "Department",
    description: "Organizasyon birimleri",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "designation",
    label: "Unvan",
    doctype: "Designation",
    description: "Personel gorev/unvan tanimlari",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "employmentType",
    label: "Istihdam Turu",
    doctype: "Employment Type",
    description: "Kadrolu, sozlesmeli veya donemsel calisma turleri",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "employeeGrade",
    label: "Personel Derecesi",
    doctype: "Employee Grade",
    description: "Derece/kademe bazli IK siniflandirmasi",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "employeeGroup",
    label: "Personel Grubu",
    doctype: "Employee Group",
    description: "Calisan gruplari ve segmentleri",
    category: "organization",
    canCreateQuickly: true
  },
  {
    key: "leaveType",
    label: "Izin Tipi",
    doctype: "Leave Type",
    description: "Yillik izin, mazeret, rapor ve benzeri izin turleri",
    category: "leave",
    canCreateQuickly: true
  },
  {
    key: "holidayList",
    label: "Tatil Listesi",
    doctype: "Holiday List",
    description: "Resmi tatil ve calisma takvimi",
    category: "leave",
    canCreateQuickly: false
  },
  {
    key: "shiftType",
    label: "Vardiya Tipi",
    doctype: "Shift Type",
    description: "Gunduz/gece gibi vardiya saat sablonlari",
    category: "shift",
    canCreateQuickly: false
  },
  {
    key: "payrollPeriod",
    label: "Bordro Donemi",
    doctype: "Payroll Period",
    description: "Bordro yil ve donem tanimlari",
    category: "payroll",
    canCreateQuickly: false
  }
];

async function requestResourceList<T>(doctype: string, options: ResourceListOptions): Promise<T[]> {
  const allowed = await canReadDoctype(doctype);
  if (!allowed) {
    return [];
  }

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

function compactRecord(id: string | undefined, title: string | undefined, subtitle: string | undefined, status?: string): HrSetupMasterRecord {
  const safeId = id?.trim() || title?.trim() || "-";

  return {
    id: safeId,
    title: title?.trim() || safeId,
    subtitle: subtitle?.trim() || "-",
    status: status?.trim() || "Aktif"
  };
}

function mapMasterRecords(key: HrSetupMasterKey, rows: unknown[]): HrSetupMasterRecord[] {
  switch (key) {
    case "company":
      return (rows as CompanyRow[]).map((row) =>
        compactRecord(row.name, row.company_name ?? row.name, [row.abbr, row.default_currency].filter(Boolean).join(" / "))
      );
    case "branch":
      return (rows as BranchRow[]).map((row) => compactRecord(row.name, row.branch ?? row.name, "Sube kaydi"));
    case "department":
      return (rows as DepartmentRow[]).map((row) =>
        compactRecord(row.name, row.department_name ?? row.name, row.company ?? "Sirket bilgisi yok")
      );
    case "designation":
      return (rows as DesignationRow[]).map((row) => compactRecord(row.name, row.designation_name ?? row.name, "Unvan kaydi"));
    case "employmentType":
      return (rows as NamedRow[]).map((row) => compactRecord(row.name, row.employee_type_name ?? row.name, "Istihdam turu"));
    case "employeeGrade":
      return (rows as NamedRow[]).map((row) => compactRecord(row.name, row.grade_name ?? row.name, "Personel derecesi"));
    case "employeeGroup":
      return (rows as NamedRow[]).map((row) => compactRecord(row.name, row.group_name ?? row.name, "Personel grubu"));
    case "leaveType":
      return (rows as NamedRow[]).map((row) =>
        compactRecord(row.name, row.leave_type_name ?? row.name, row.is_active === 0 ? "Pasif" : "Izin tipi", row.is_active === 0 ? "Pasif" : "Aktif")
      );
    case "holidayList":
      return (rows as NamedRow[]).map((row) => compactRecord(row.name, row.holiday_list_name ?? row.name, "Tatil takvimi"));
    case "shiftType":
      return (rows as NamedRow[]).map((row) => compactRecord(row.name, row.shift_type_name ?? row.name, row.disabled ? "Pasif" : "Vardiya tipi", row.disabled ? "Pasif" : "Aktif"));
    case "payrollPeriod":
      return (rows as NamedRow[]).map((row) =>
        compactRecord(row.name, row.payroll_period_name ?? row.name, [row.from_date, row.to_date].filter(Boolean).join(" - "))
      );
  }
}

function getFieldsForMaster(key: HrSetupMasterKey): string[] {
  switch (key) {
    case "company":
      return ["name", "company_name", "abbr", "default_currency"];
    case "branch":
      return ["name", "branch"];
    case "department":
      return ["name", "department_name", "company"];
    case "designation":
      return ["name", "designation_name"];
    case "employmentType":
      return ["name", "employee_type_name"];
    case "employeeGrade":
      return ["name", "grade_name"];
    case "employeeGroup":
      return ["name", "group_name"];
    case "leaveType":
      return ["name", "leave_type_name", "is_active"];
    case "holidayList":
      return ["name", "holiday_list_name"];
    case "shiftType":
      return ["name", "shift_type_name", "disabled"];
    case "payrollPeriod":
      return ["name", "payroll_period_name", "from_date", "to_date"];
  }
}

function getOrderByForMaster(key: HrSetupMasterKey): string {
  if (key === "payrollPeriod") return "from_date desc";
  return "modified desc";
}

async function fetchMaster(definition: HrSetupMasterDefinition): Promise<HrSetupMasterState> {
  try {
    const rows = await requestResourceList<unknown>(definition.doctype, {
      fields: getFieldsForMaster(definition.key),
      orderBy: getOrderByForMaster(definition.key),
      limit: 100
    });
    const records = mapMasterRecords(definition.key, rows);
    return { ...definition, records, count: records.length, loadingFailed: false };
  } catch {
    return { ...definition, records: [], count: 0, loadingFailed: true };
  }
}

async function fetchEmployeeQuality(): Promise<HrSetupEmployeeQuality> {
  try {
    const rows = await requestResourceList<EmployeeQualityRow>("Employee", {
      fields: ["name", "status", "department", "designation", "employment_type"],
      orderBy: "employee_name asc",
      limit: 500
    });
    const activeRows = rows.filter((row) => (row.status ?? "").toLowerCase() === "active");

    return {
      activeEmployees: activeRows.length,
      missingDepartment: activeRows.filter((row) => !row.department?.trim()).length,
      missingDesignation: activeRows.filter((row) => !row.designation?.trim()).length,
      missingEmploymentType: activeRows.filter((row) => !row.employment_type?.trim()).length
    };
  } catch {
    return {
      activeEmployees: 0,
      missingDepartment: 0,
      missingDesignation: 0,
      missingEmploymentType: 0
    };
  }
}

function hasRecords(masters: HrSetupMasterState[], key: HrSetupMasterKey) {
  return (masters.find((master) => master.key === key)?.count ?? 0) > 0;
}

function buildSteps(masters: HrSetupMasterState[]): HrSetupStep[] {
  const stepDefinitions = [
    {
      key: "organization" as const,
      title: "Organizasyon",
      description: "Sirket, sube, departman, unvan ve istihdam siniflari",
      requiredKeys: ["company", "department", "designation", "employmentType"] as HrSetupMasterKey[],
      icon: Users
    },
    {
      key: "leave" as const,
      title: "Izin",
      description: "Izin tipi, tatil listesi ve izin donemi temeli",
      requiredKeys: ["leaveType", "holidayList"] as HrSetupMasterKey[],
      icon: CalendarDays
    },
    {
      key: "shift" as const,
      title: "Vardiya",
      description: "Vardiya tipi ve attendance kullanimi icin temel ayar",
      requiredKeys: ["shiftType"] as HrSetupMasterKey[],
      icon: BriefcaseBusiness
    },
    {
      key: "payroll" as const,
      title: "Bordro",
      description: "Bordro donemi ve maas akisina hazirlik",
      requiredKeys: ["payrollPeriod"] as HrSetupMasterKey[],
      icon: CircleDollarSign
    },
    {
      key: "access" as const,
      title: "Yetki",
      description: "IK rolleri ve sayfa erisimleri aktif uygulama katmaninda yonetilir",
      requiredKeys: [] as HrSetupMasterKey[],
      icon: ShieldCheck
    }
  ];

  return stepDefinitions.map((step) => {
    const readyCount = step.requiredKeys.filter((key) => hasRecords(masters, key)).length;
    const totalCount = step.requiredKeys.length || 1;

    return {
      key: step.key,
      title: step.title,
      description: step.description,
      completed: step.requiredKeys.length === 0 || readyCount === step.requiredKeys.length,
      readyCount: step.requiredKeys.length === 0 ? 1 : readyCount,
      totalCount,
      icon: step.icon
    };
  });
}

function buildAlerts(masters: HrSetupMasterState[], employeeQuality: HrSetupEmployeeQuality): HrSetupAlert[] {
  const alerts: HrSetupAlert[] = [];

  if (employeeQuality.missingDepartment > 0) {
    alerts.push({
      id: "missing-department",
      title: "Departmansiz personel var",
      detail: `${employeeQuality.missingDepartment} aktif personelde departman bilgisi eksik.`,
      tone: "warning"
    });
  }

  if (employeeQuality.missingDesignation > 0) {
    alerts.push({
      id: "missing-designation",
      title: "Unvansiz personel var",
      detail: `${employeeQuality.missingDesignation} aktif personelde unvan bilgisi eksik.`,
      tone: "warning"
    });
  }

  if (employeeQuality.missingEmploymentType > 0) {
    alerts.push({
      id: "missing-employment-type",
      title: "Istihdam turu eksigi",
      detail: `${employeeQuality.missingEmploymentType} aktif personelde istihdam turu tanimli degil.`,
      tone: "info"
    });
  }

  const missingMasters = [
    ["company", "Sirket kaydi olmadan IK kurulumu tamamlanamaz."],
    ["department", "Departman kaydi yoksa raporlama ve izin onayi zayiflar."],
    ["designation", "Unvan kaydi yoksa personel kartlari eksik kalir."],
    ["leaveType", "Izin tipi tanimlanmadan izin basvurulari saglikli calismaz."],
    ["holidayList", "Tatil listesi yoksa izin ve bordro gun hesaplari eksik kalir."],
    ["shiftType", "Vardiya tipi yoksa attendance akisi tamamlanamaz."],
    ["payrollPeriod", "Bordro donemi yoksa aylik bordro hazirligi eksik kalir."]
  ] as const;

  for (const [key, detail] of missingMasters) {
    if (!hasRecords(masters, key)) {
      alerts.push({
        id: `missing-${key}`,
        title: `${hrSetupMasterDefinitions.find((item) => item.key === key)?.label ?? key} eksik`,
        detail,
        tone: key === "company" ? "danger" : "warning"
      });
    }
  }

  for (const master of masters.filter((item) => item.loadingFailed)) {
    alerts.push({
      id: `failed-${master.key}`,
      title: `${master.label} okunamadi`,
      detail: "Bu kayit tipi icin yetki veya backend erisimi kontrol edilmeli.",
      tone: "info"
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "ready",
      title: "Temel IK kurulumu temiz gorunuyor",
      detail: "Ana master veriler ve personel zorunlu alanlari icin kritik eksik bulunmadi.",
      tone: "success"
    });
  }

  return alerts;
}

function buildSummary(masters: HrSetupMasterState[], employeeQuality: HrSetupEmployeeQuality): HrSetupSummary {
  const organizationKeys: HrSetupMasterKey[] = ["company", "branch", "department", "designation", "employmentType", "employeeGrade", "employeeGroup"];
  const processKeys: HrSetupMasterKey[] = ["leaveType", "holidayList", "shiftType", "payrollPeriod"];

  return {
    companyCount: masters.find((master) => master.key === "company")?.count ?? 0,
    activeEmployees: employeeQuality.activeEmployees,
    organizationReadyCount: organizationKeys.filter((key) => hasRecords(masters, key)).length,
    organizationTotalCount: organizationKeys.length,
    processReadyCount: processKeys.filter((key) => hasRecords(masters, key)).length,
    processTotalCount: processKeys.length
  };
}

export async function fetchHrSetupData(): Promise<HrSetupData> {
  const [masters, employeeQuality] = await Promise.all([
    Promise.all(hrSetupMasterDefinitions.map(fetchMaster)),
    fetchEmployeeQuality()
  ]);

  return {
    masters,
    steps: buildSteps(masters),
    alerts: buildAlerts(masters, employeeQuality),
    employeeQuality,
    summary: buildSummary(masters, employeeQuality)
  };
}

function buildQuickCreatePayload(input: HrSetupQuickCreateInput) {
  const title = input.title.trim();
  const company = input.company.trim();

  switch (input.masterKey) {
    case "branch":
      return { doctype: "Branch", payload: { branch: title } };
    case "department":
      return { doctype: "Department", payload: { department_name: title, company: company || undefined } };
    case "designation":
      return { doctype: "Designation", payload: { designation_name: title } };
    case "employmentType":
      return { doctype: "Employment Type", payload: { employee_type_name: title } };
    case "employeeGrade":
      return { doctype: "Employee Grade", payload: { grade_name: title } };
    case "employeeGroup":
      return { doctype: "Employee Group", payload: { group_name: title } };
    case "leaveType":
      return { doctype: "Leave Type", payload: { leave_type_name: title, is_active: 1 } };
    default:
      throw new Error("Bu kayit tipi hizli olusturma icin desteklenmiyor.");
  }
}

export async function createHrSetupMaster(input: HrSetupQuickCreateInput): Promise<void> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Kayit adi zorunludur.");
  }

  const { doctype, payload } = buildQuickCreatePayload(input);
  await postErpDoc(doctype, null, payload, { timeoutMs: REQUEST_TIMEOUT_MS });
}

