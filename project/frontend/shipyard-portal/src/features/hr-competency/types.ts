export type HrCompetencySkillTag = {
  skillId: string;
  skillName: string;
  proficiencyLabel: string;
  proficiencyTone: "neutral" | "warning" | "positive";
};

export type HrCompetencyEmployeeRow = {
  mapId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  updatedAt: string | null;
  skills: HrCompetencySkillTag[];
};

export type HrCompetencyRoleSummaryItem = {
  key: string;
  label: string;
  employeeCount: number;
  assignmentCount: number;
};

export type HrCompetencySkillCoverageItem = {
  skillId: string;
  skillName: string;
  employeeCount: number;
};

export type HrCompetencySummary = {
  totalSkills: number;
  totalMaps: number;
  mappedEmployeeCount: number;
  totalAssignments: number;
  missingSkillEmployeeCount: number;
};

export type HrCompetencyData = {
  employees: HrCompetencyEmployeeRow[];
  roleSummary: HrCompetencyRoleSummaryItem[];
  topSkillCoverage: HrCompetencySkillCoverageItem[];
  summary: HrCompetencySummary;
};
