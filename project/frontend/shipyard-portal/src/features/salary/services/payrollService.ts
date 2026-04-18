import type {
  OvertimeHistory,
  PayrollCalculation,
  PayrollPeriod,
  SalaryInfo,
  WorkHistory
} from "../types";
import { fetchOvertimeHistory, fetchSalaryInfo, fetchWorkHistory } from "./salaryService";

// Overtime multipliers
const OVERTIME_WEEKDAY_MULTIPLIER = 1.5;
const OVERTIME_WEEKEND_MULTIPLIER = 2.0;

// Standard working hours per month (30 days * 7.5 hours = 225 hours)
const STANDARD_MONTHLY_HOURS = 225;
const STANDARD_DAILY_HOURS = 7.5;

type PayrollCalculationInput = {
  employeeId: string;
  period: PayrollPeriod;
  workHistory: WorkHistory | null;
  overtimeHistory: OvertimeHistory | null;
  salaryInfo: SalaryInfo | null;
};

function getPeriodDates(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

function isWeekendDay(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isDateInPeriod(dateStr: string, period: PayrollPeriod): boolean {
  const monthStart = new Date(period.year, period.month - 1, 1);
  const monthEnd = new Date(period.year, period.month, 0);
  const value = new Date(dateStr);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  return value >= monthStart && value <= monthEnd;
}

export function calculatePayroll(input: PayrollCalculationInput): PayrollCalculation {
  const { employeeId, period, workHistory, overtimeHistory, salaryInfo } = input;

  const baseSalary = salaryInfo?.baseSalary ?? 0;
  const hourlyRate = baseSalary > 0 ? baseSalary / STANDARD_MONTHLY_HOURS : 0;

  // Calculate work history statistics
  let totalAttendanceDays = 0;
  let totalHoursWorked = 0;
  let weekdayHours = 0;
  let weekendHours = 0;

  if (workHistory && workHistory.items.length > 0) {
    totalAttendanceDays = workHistory.items.length;

    for (const item of workHistory.items) {
      const hours = item.hoursWorked;
      totalHoursWorked += hours;

      if (isWeekendDay(item.date)) {
        weekendHours += hours;
      } else {
        weekdayHours += hours;
      }
    }
  }

  // Regular hours is the minimum of actual hours and standard hours
  const regularHours = Math.min(totalHoursWorked, STANDARD_MONTHLY_HOURS);

  // Overtime from attendance is anything beyond standard hours
  const attendanceOvertimeHours = Math.max(0, totalHoursWorked - STANDARD_MONTHLY_HOURS);

  // Split attendance overtime into weekday and weekend portions
  const workDaysRatio = totalHoursWorked > 0 ? weekdayHours / totalHoursWorked : 0.7;
  const weekendRatio = totalHoursWorked > 0 ? weekendHours / totalHoursWorked : 0.3;

  const attendanceWeekdayOvertime = Math.round(attendanceOvertimeHours * workDaysRatio * 100) / 100;
  const attendanceWeekendOvertime = Math.round(attendanceOvertimeHours * weekendRatio * 100) / 100;

  // Pull approved overtime requests for selected payroll period.
  let approvedWeekdayOvertime = 0;
  let approvedWeekendOvertime = 0;
  if (overtimeHistory && overtimeHistory.items.length > 0) {
    for (const item of overtimeHistory.items) {
      if (item.status !== "approved") continue;
      if (!isDateInPeriod(item.date, period)) continue;

      if (isWeekendDay(item.date)) {
        approvedWeekendOvertime += item.hours;
      } else {
        approvedWeekdayOvertime += item.hours;
      }
    }
  }

  const overtimeWeekdayHours = Math.max(
    Math.round(approvedWeekdayOvertime * 100) / 100,
    attendanceWeekdayOvertime
  );
  const overtimeWeekendHours = Math.max(
    Math.round(approvedWeekendOvertime * 100) / 100,
    attendanceWeekendOvertime
  );

  // Calculate overtime pay
  const overtimeWeekdayPay = overtimeWeekdayHours * hourlyRate * OVERTIME_WEEKDAY_MULTIPLIER;
  const overtimeWeekendPay = overtimeWeekendHours * hourlyRate * OVERTIME_WEEKEND_MULTIPLIER;
  const totalOvertimePay = Math.round((overtimeWeekdayPay + overtimeWeekendPay) * 100) / 100;

  // Total earnings = base + overtime pay
  const totalEarnings = Math.round((baseSalary + totalOvertimePay) * 100) / 100;

  // Deductions (simplified - in real app would include taxes, insurance, etc.)
  const totalDeductions = 0; // Would calculate taxes here

  const netSalary = Math.round((totalEarnings - totalDeductions) * 100) / 100;

  return {
    employeeId,
    period,
    baseSalary,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    regularHoursWorked: Math.round(regularHours * 100) / 100,
    overtimeWeekdayHours,
    overtimeWeekendHours,
    overtimeWeekdayRate: OVERTIME_WEEKDAY_MULTIPLIER,
    overtimeWeekendRate: OVERTIME_WEEKEND_MULTIPLIER,
    overtimeWeekdayPay: Math.round(overtimeWeekdayPay * 100) / 100,
    overtimeWeekendPay: Math.round(overtimeWeekendPay * 100) / 100,
    totalOvertimePay,
    totalEarnings,
    totalDeductions,
    netSalary,
    workDays: Math.round(totalAttendanceDays * 100) / 100,
    attendanceDays: totalAttendanceDays
  };
}

export async function calculatePayrollForEmployee(
  employeeId: string,
  year: number,
  month: number
): Promise<PayrollCalculation> {
  const period: PayrollPeriod = {
    year,
    month,
    label: new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(year, month - 1)),
    startDate: `${year}-${String(month).padStart(2, "0")}-01`,
    endDate: `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`
  };

  const [salaryInfo, workHistory, overtimeHistory] = await Promise.all([
    fetchSalaryInfo(employeeId),
    fetchWorkHistory(employeeId, year, month),
    fetchOvertimeHistory(employeeId)
  ]);

  return calculatePayroll({
    employeeId,
    period,
    workHistory,
    overtimeHistory,
    salaryInfo
  });
}

export function formatPayrollPeriod(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getOvertimeRateDescription(): string {
  return `Hafta ici: ${OVERTIME_WEEKDAY_MULTIPLIER}x | Hafta sonu/tatil: ${OVERTIME_WEEKEND_MULTIPLIER}x`;
}
