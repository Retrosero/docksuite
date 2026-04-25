import { canReadDoctype, requestErpJson } from "../../../lib/erpApi";
import type {
  HrCompetencyData,
  HrCompetencyEmployeeRow,
  HrCompetencyRoleSummaryItem,
  HrCompetencySkillCoverageItem,
  HrCompetencySkillTag
} from "../types";

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeDocResponse = {
  data?: Record<string, unknown>;
};

type ResourceListOptions = {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
};

type SkillRow = {
  name?: string;
  skill_name?: string;
  disabled?: number | 0 | 1;
};

type SkillMapRow = {
  name?: string;
  employee?: string;
  employee_name?: string;
  designation?: string;
  department?: string;
  modified?: string;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  designation?: string;
  department?: string;
};

const REQUEST_TIMEOUT_MS = 9000;
const MAX_MAP_ROWS = 60;
const MAX_EMPLOYEE_ROWS = 60;

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

async function fetchSkillCatalog(): Promise<SkillRow[]> {
  const attempts: string[][] = [
    ["name", "skill_name", "disabled"],
    ["name", "skill_name"],
    ["name"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<SkillRow>("Skill", {
        fields,
        orderBy: "modified desc",
        limit: 500
      });
    } catch (error) {
      if (isFieldNotPermittedInQuery(error, "skill_name") || isFieldNotPermittedInQuery(error, "disabled")) {
        continue;
      }
    }
  }

  return [];
}

async function fetchSkillMaps(): Promise<SkillMapRow[]> {
  const attempts: string[][] = [
    ["name", "employee", "employee_name", "designation", "department", "modified"],
    ["name", "employee", "designation", "department", "modified"],
    ["name", "employee", "modified"],
    ["name", "modified"]
  ];

  for (const fields of attempts) {
    try {
      return await requestResourceList<SkillMapRow>("Employee Skill Map", {
        fields,
        orderBy: "modified desc",
        limit: MAX_MAP_ROWS
      });
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "employee_name") ||
        isFieldNotPermittedInQuery(error, "designation") ||
        isFieldNotPermittedInQuery(error, "department")
      ) {
        continue;
      }
    }
  }

  return [];
}

async function fetchEmployeeIndex(employeeIds: string[]): Promise<Map<string, EmployeeRow>> {
  if (employeeIds.length === 0) {
    return new Map();
  }

  const attempts: string[][] = [
    ["name", "employee_name", "designation", "department"],
    ["name", "employee_name", "designation"],
    ["name", "employee_name"]
  ];

  for (const fields of attempts) {
    try {
      const rows = await requestResourceList<EmployeeRow>("Employee", {
        fields,
        filters: [["name", "in", employeeIds]],
        limit: 1000
      });
      return new Map(rows.map((row) => [row.name ?? "-", row] as const));
    } catch (error) {
      if (
        isFieldNotPermittedInQuery(error, "designation") ||
        isFieldNotPermittedInQuery(error, "department") ||
        isFieldNotPermittedInQuery(error, "employee_name")
      ) {
        continue;
      }
    }
  }

  return new Map();
}

async function fetchSkillMapDoc(mapId: string) {
  try {
    const payload = await requestErpJson<FrappeDocResponse>(
      `/resource/${encodeURIComponent("Employee Skill Map")}/${encodeURIComponent(mapId)}`,
      undefined,
      { timeoutMs: REQUEST_TIMEOUT_MS }
    );
    return payload.data ?? null;
  } catch {
    return null;
  }
}

function toProficiencyMeta(rawValue: string | undefined) {
  const value = rawValue?.trim() || "Belirsiz";
  const key = normalize(value);

  if (
    key.includes("expert") ||
    key.includes("ileri") ||
    key.includes("advanced") ||
    key.includes("master") ||
    key.includes("uzman")
  ) {
    return { label: value, tone: "positive" as const };
  }

  if (key.includes("basic") || key.includes("beginner") || key.includes("temel")) {
    return { label: value, tone: "warning" as const };
  }

  return { label: value, tone: "neutral" as const };
}

function extractSkillsFromMapDoc(doc: Record<string, unknown> | null, skillNameById: Map<string, string>): HrCompetencySkillTag[] {
  if (!doc) {
    return [];
  }

  const collections = Object.values(doc).filter((value): value is unknown[] => Array.isArray(value));
  const skillRows = collections.flatMap((collection) =>
    collection.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
  );

  const parsed = skillRows
    .map((row) => {
      const rawSkill = typeof row.skill === "string" ? row.skill.trim() : "";
      const rawSkillName =
        typeof row.skill_name === "string"
          ? row.skill_name.trim()
          : typeof row.name === "string"
            ? row.name.trim()
            : "";
      const proficiencySource =
        typeof row.proficiency === "string"
          ? row.proficiency
          : typeof row.proficiency_level === "string"
            ? row.proficiency_level
            : typeof row.level === "string"
              ? row.level
              : "";

      if (!rawSkill && !rawSkillName) {
        return null;
      }

      const skillId = rawSkill || rawSkillName;
      const fallbackSkillName = rawSkillName || rawSkill || "Yetkinlik";
      const skillName = skillNameById.get(skillId) ?? fallbackSkillName;
      const proficiency = toProficiencyMeta(proficiencySource);

      return {
        skillId,
        skillName,
        proficiencyLabel: proficiency.label,
        proficiencyTone: proficiency.tone
      } satisfies HrCompetencySkillTag;
    })
    .filter((item): item is HrCompetencySkillTag => item !== null);

  const unique = new Map<string, HrCompetencySkillTag>();
  for (const item of parsed) {
    if (!unique.has(item.skillId)) {
      unique.set(item.skillId, item);
    }
  }

  return [...unique.values()];
}

export async function fetchHrCompetencyData(): Promise<HrCompetencyData> {
  const [canReadSkill, canReadSkillMap, canReadEmployee] = await Promise.all([
    canReadDoctype("Skill"),
    canReadDoctype("Employee Skill Map"),
    canReadDoctype("Employee")
  ]);

  const [skillRows, mapRows] = await Promise.all([
    canReadSkill ? fetchSkillCatalog() : Promise.resolve([]),
    canReadSkillMap ? fetchSkillMaps() : Promise.resolve([])
  ]);

  const activeSkillRows = skillRows.filter((row) => row.disabled !== 1);
  const skillNameById = new Map(
    activeSkillRows.map((row) => [row.name ?? "-", row.skill_name?.trim() || row.name || "Yetkinlik"] as const)
  );

  const skillMaps = mapRows.filter((row) => (row.name ?? "").trim().length > 0).slice(0, MAX_EMPLOYEE_ROWS);
  const employeeIds = [...new Set(skillMaps.map((row) => row.employee?.trim() || "").filter((value) => value.length > 0))];

  const [employeeIndex, mapDocs] = await Promise.all([
    canReadEmployee ? fetchEmployeeIndex(employeeIds) : Promise.resolve(new Map<string, EmployeeRow>()),
    Promise.all(skillMaps.map((row) => fetchSkillMapDoc(row.name ?? "-")))
  ]);

  const skillByMapId = new Map<string, HrCompetencySkillTag[]>();
  for (let index = 0; index < skillMaps.length; index += 1) {
    const mapId = skillMaps[index]?.name ?? "-";
    const doc = mapDocs[index] ?? null;
    skillByMapId.set(mapId, extractSkillsFromMapDoc(doc, skillNameById));
  }

  const employees: HrCompetencyEmployeeRow[] = skillMaps.map((row) => {
    const employeeId = row.employee?.trim() || "-";
    const employee = employeeIndex.get(employeeId);
    const mapId = row.name ?? "-";
    return {
      mapId,
      employeeId,
      employeeName: row.employee_name?.trim() || employee?.employee_name?.trim() || employeeId,
      designation: row.designation?.trim() || employee?.designation?.trim() || "-",
      department: row.department?.trim() || employee?.department?.trim() || "-",
      updatedAt: row.modified ?? null,
      skills: skillByMapId.get(mapId) ?? []
    };
  });

  const roleSummaryMap = new Map<string, { label: string; employeeCount: number; assignmentCount: number }>();
  for (const row of employees) {
    const key = row.designation !== "-" ? row.designation : "Tanimsiz";
    const current = roleSummaryMap.get(key) ?? { label: key, employeeCount: 0, assignmentCount: 0 };
    current.employeeCount += 1;
    current.assignmentCount += row.skills.length;
    roleSummaryMap.set(key, current);
  }

  const roleSummary: HrCompetencyRoleSummaryItem[] = [...roleSummaryMap.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      employeeCount: value.employeeCount,
      assignmentCount: value.assignmentCount
    }))
    .sort((left, right) => right.employeeCount - left.employeeCount || right.assignmentCount - left.assignmentCount)
    .slice(0, 12);

  const skillCoverageCount = new Map<string, { skillName: string; employeeCount: number }>();
  for (const row of employees) {
    const uniqueSkillIds = [...new Set(row.skills.map((skill) => skill.skillId))];
    for (const skillId of uniqueSkillIds) {
      const skillName =
        row.skills.find((skill) => skill.skillId === skillId)?.skillName ?? skillNameById.get(skillId) ?? skillId;
      const current = skillCoverageCount.get(skillId) ?? { skillName, employeeCount: 0 };
      current.employeeCount += 1;
      skillCoverageCount.set(skillId, current);
    }
  }

  const topSkillCoverage: HrCompetencySkillCoverageItem[] = [...skillCoverageCount.entries()]
    .map(([skillId, value]) => ({
      skillId,
      skillName: value.skillName,
      employeeCount: value.employeeCount
    }))
    .sort((left, right) => right.employeeCount - left.employeeCount)
    .slice(0, 15);

  const mappedEmployeeCount = employees.filter((row) => row.employeeId !== "-").length;
  const totalAssignments = employees.reduce((total, row) => total + row.skills.length, 0);
  const missingSkillEmployeeCount = employees.filter((row) => row.skills.length === 0).length;

  return {
    employees,
    roleSummary,
    topSkillCoverage,
    summary: {
      totalSkills: activeSkillRows.length,
      totalMaps: skillMaps.length,
      mappedEmployeeCount,
      totalAssignments,
      missingSkillEmployeeCount
    }
  };
}
