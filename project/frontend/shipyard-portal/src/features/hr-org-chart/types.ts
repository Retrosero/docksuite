export type HrOrgEmployeeNode = {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  reportsTo: string | null;
  reportsToName: string | null;
  directReportCount: number;
};

export type HrOrgManagerNode = {
  managerId: string;
  managerName: string;
  designation: string;
  department: string;
  directReports: HrOrgEmployeeNode[];
};

export type HrOrgDepartmentSummaryItem = {
  key: string;
  label: string;
  employeeCount: number;
};

export type HrOrgSummary = {
  totalEmployeeCount: number;
  managerCount: number;
  topManagerCount: number;
  withManagerCount: number;
  withoutManagerCount: number;
};

export type HrOrgData = {
  managers: HrOrgManagerNode[];
  unassignedEmployees: HrOrgEmployeeNode[];
  departmentSummary: HrOrgDepartmentSummaryItem[];
  summary: HrOrgSummary;
};
