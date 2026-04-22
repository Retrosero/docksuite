export type AttendanceTimeEmployeeOption = {
  id: string;
  name: string;
};

export type BulkAttendanceTimeInput = {
  employeeIds: string[];
  attendanceDate: string;
  inTime?: string;
  outTime?: string;
  shift?: string;
  status?: string;
};

export type BulkAttendanceTimeResult = {
  ok: boolean;
  attendance_date: string;
  total: number;
  created_count: number;
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  failed?: Array<{ employee: string; message: string }>;
  skipped?: Array<{ employee: string; reason: string }>;
};

export type MonthlyPayrollPreviewRow = {
  employee: string;
  employee_name: string;
  salary_source: string;
  attendance_days: number;
  total_hours: number;
  standard_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  overtime_multiplier: number;
  overtime_pay: number;
  base_salary: number;
  estimated_total_earnings: number;
};

export type MonthlyPayrollPreview = {
  year: number;
  month: number;
  period_start: string;
  period_end_exclusive: string;
  standard_monthly_hours: number;
  rows: MonthlyPayrollPreviewRow[];
  totals: {
    employee_count: number;
    total_hours: number;
    overtime_hours: number;
    overtime_pay: number;
    estimated_total_earnings: number;
  };
};
