export type ModuleCard = {
  title: string;
  description: string;
  metric: string;
  tone: "sea" | "sand" | "steel" | "sun";
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
  activeTeamCount: string;
  openIssueCount: string;
  modules: ModuleCard[];
  shift: ShiftSnapshot;
};
