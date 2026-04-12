export type OperationStat = {
  label: string;
  value: string;
  helper: string;
};

export type OperationAction = {
  title: string;
  description: string;
  cta: string;
  tone: "sea" | "sand" | "steel" | "sun";
};

export type TaskItem = {
  title: string;
  team: string;
  assignee: string;
  priority: "Yuksek" | "Orta" | "Dusuk";
  status: string;
  dueLabel: string;
};

export type TeamItem = {
  name: string;
  lead: string;
  specialty: string;
  members: number;
  shift: string;
};

export type FieldReportItem = {
  title: string;
  employee: string;
  location: string;
  issueType: string;
  severity: string;
  time: string;
};

export type ZimmetItem = {
  title: string;
  holder: string;
  quantity: string;
  status: string;
  returnPlan: string;
};

export type AttendanceItem = {
  label: string;
  value: string;
  detail: string;
};

export type OperationsSnapshot = {
  headline: string;
  subline: string;
  stats: OperationStat[];
  actions: OperationAction[];
  taskItems: TaskItem[];
  teamItems: TeamItem[];
  fieldReports: FieldReportItem[];
  zimmetItems: ZimmetItem[];
  attendanceItems: AttendanceItem[];
};
