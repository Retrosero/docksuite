import type { LucideIcon } from "lucide-react";

export type HrSetupCategory = "organization" | "leave" | "shift" | "payroll" | "access";

export type HrSetupMasterKey =
  | "company"
  | "branch"
  | "department"
  | "designation"
  | "employmentType"
  | "employeeGrade"
  | "employeeGroup"
  | "leaveType"
  | "holidayList"
  | "shiftType"
  | "payrollPeriod";

export type HrSetupMasterRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
};

export type HrSetupMasterDefinition = {
  key: HrSetupMasterKey;
  label: string;
  doctype: string;
  description: string;
  category: HrSetupCategory;
  canCreateQuickly: boolean;
};

export type HrSetupMasterState = HrSetupMasterDefinition & {
  records: HrSetupMasterRecord[];
  count: number;
  loadingFailed: boolean;
};

export type HrSetupStep = {
  key: HrSetupCategory;
  title: string;
  description: string;
  completed: boolean;
  readyCount: number;
  totalCount: number;
  icon: LucideIcon;
};

export type HrSetupAlertTone = "warning" | "danger" | "info" | "success";

export type HrSetupAlert = {
  id: string;
  title: string;
  detail: string;
  tone: HrSetupAlertTone;
};

export type HrSetupEmployeeQuality = {
  activeEmployees: number;
  missingDepartment: number;
  missingDesignation: number;
  missingEmploymentType: number;
};

export type HrSetupSummary = {
  companyCount: number;
  activeEmployees: number;
  organizationReadyCount: number;
  organizationTotalCount: number;
  processReadyCount: number;
  processTotalCount: number;
};

export type HrSetupData = {
  masters: HrSetupMasterState[];
  steps: HrSetupStep[];
  alerts: HrSetupAlert[];
  employeeQuality: HrSetupEmployeeQuality;
  summary: HrSetupSummary;
};

export type HrSetupQuickCreateInput = {
  masterKey: HrSetupMasterKey;
  title: string;
  company: string;
};

