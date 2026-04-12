export type ModuleCard = {
  title: string;
  description: string;
  metric: string;
  tone: "sea" | "sand" | "steel" | "sun";
};

export type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  tone: "sea" | "sand" | "steel" | "sun";
};

export type DashboardWorkload = {
  label: string;
  value: string;
  percent: number;
  tone: "sea" | "sand" | "steel" | "sun";
};

export type DashboardTask = {
  title: string;
  owner: string;
  team: string;
  dueTime: string;
  priority: "Yuksek" | "Orta" | "Dusuk";
  status: string;
};

export type DashboardActivity = {
  title: string;
  detail: string;
  time: string;
  tone: "sea" | "sand" | "steel" | "sun";
};

export type DashboardTeam = {
  name: string;
  role: string;
  load: string;
  status: string;
};

export type DashboardAction = {
  title: string;
  description: string;
};

export type ShiftSnapshot = {
  title: string;
  timeRange: string;
  teamName: string;
  focus: string;
  attendance: string;
};

export type DashboardSnapshot = {
  headline: string;
  subline: string;
  sectionLabel: string;
  summaryTitle: string;
  summarySubline: string;
  sidebarLabel: string;
  sidebarNote: string;
  sidebarStatLabel: string;
  sidebarStatValue: string;
  sidebarStatHint: string;
  kpis: DashboardKpi[];
  workload: DashboardWorkload[];
  tasks: DashboardTask[];
  activities: DashboardActivity[];
  teams: DashboardTeam[];
  actions: DashboardAction[];
  activeTeamCount: string;
  openIssueCount: string;
  modules: ModuleCard[];
  shift: ShiftSnapshot;
};
