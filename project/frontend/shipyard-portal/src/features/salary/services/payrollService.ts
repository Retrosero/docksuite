import type {
  OvertimeHistory,
  PayrollCalculation,
  PayrollSyncResult,
  PayrollPeriod,
  SalaryInfo,
  WorkHistory
} from "../types";
import { requestErpJson } from "../../../lib/erpApi";
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

type FrappeListResponse<T> = {
  data?: T[];
};

type FrappeMethodResponse<T> = {
  message?: T;
};

type EmployeePayrollRow = {
  name?: string;
  company?: string;
  salary_currency?: string;
};

type SalaryStructureAssignmentRow = {
  name?: string;
  salary_structure?: string;
  company?: string;
  currency?: string;
  from_date?: string;
  docstatus?: number;
};

type AdditionalSalaryRow = {
  name?: string;
  docstatus?: number;
  amount?: number;
};

type SalarySlipRow = {
  name?: string;
  docstatus?: number;
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

async function requestResourceList<T>(doctype: string, options: {
  fields: string[];
  filters?: unknown[];
  orderBy?: string;
  limit?: number;
}): Promise<T[]> {
  const params = new URLSearchParams();
  params.set("fields", JSON.stringify(options.fields));
  params.set("limit_page_length", String(options.limit ?? 200));

  if (options.filters && options.filters.length > 0) {
    params.set("filters", JSON.stringify(options.filters));
  }

  if (options.orderBy) {
    params.set("order_by", options.orderBy);
  }

  const encodedDoctype = encodeURIComponent(doctype);
  const payload = await requestErpJson<FrappeListResponse<T>>(`/resource/${encodedDoctype}`, params, {
    timeoutMs: 12000
  });
  return payload.data ?? [];
}

async function insertDoc<T>(doc: Record<string, unknown>): Promise<T> {
  const payload = await requestErpJson<FrappeMethodResponse<T>>("/method/frappe.client.insert", undefined, {
    method: "POST",
    body: {
      doc: JSON.stringify(doc)
    },
    timeoutMs: 12000
  });

  if (!payload.message) {
    throw new Error("ERPNext kaydi olusturulamadi.");
  }
  return payload.message;
}

async function submitDoc<T>(doctype: string, name: string): Promise<T> {
  const currentDoc = await requestErpJson<{ data?: Record<string, unknown> }>(
    `/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    undefined,
    { timeoutMs: 12000 }
  );

  const payload = await requestErpJson<FrappeMethodResponse<T>>("/method/frappe.client.submit", undefined, {
    method: "POST",
    body: {
      doc: JSON.stringify(currentDoc.data ?? {})
    },
    timeoutMs: 12000
  });

  if (!payload.message) {
    throw new Error("ERPNext kaydi submit edilemedi.");
  }
  return payload.message;
}

async function updateDoc(doctype: string, name: string, values: Record<string, string | number>) {
  await requestErpJson(
    `/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
    undefined,
    {
      method: "PUT",
      body: values,
      timeoutMs: 12000
    }
  );
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

export async function createPayrollSlipInErpnext(
  employeeId: string,
  period: PayrollPeriod,
  calculation: PayrollCalculation
): Promise<PayrollSyncResult> {
  const employeeRows = await requestResourceList<EmployeePayrollRow>("Employee", {
    fields: ["name", "company", "salary_currency"],
    filters: [["name", "=", employeeId]],
    limit: 1
  });

  const employee = employeeRows[0];
  if (!employee?.name || !employee.company) {
    throw new Error("Personel kartinda sirket bilgisi eksik.");
  }

  const assignmentRows = await requestResourceList<SalaryStructureAssignmentRow>("Salary Structure Assignment", {
    fields: ["name", "salary_structure", "company", "currency", "from_date", "docstatus"],
    filters: [
      ["employee", "=", employeeId],
      ["docstatus", "=", 1],
      ["from_date", "<=", period.startDate]
    ],
    orderBy: "from_date desc",
    limit: 1
  });

  const assignment = assignmentRows[0];
  const salaryStructure = assignment?.salary_structure?.trim() ?? "";
  if (!salaryStructure) {
    throw new Error("Bu donem icin aktif Salary Structure Assignment bulunamadi.");
  }

  const overtimeAmount = Math.round(calculation.totalOvertimePay * 100) / 100;
  if (!Number.isFinite(overtimeAmount) || overtimeAmount < 0) {
    throw new Error("Mesai odeme tutari gecersiz.");
  }

  let additionalSalaryName = "";
  let createdAdditionalSalary = false;

  if (overtimeAmount > 0) {
    const additionalRows = await requestResourceList<AdditionalSalaryRow>("Additional Salary", {
      fields: ["name", "docstatus", "amount"],
      filters: [
        ["employee", "=", employeeId],
        ["salary_component", "=", "Mesai Odemesi"],
        ["payroll_date", "=", period.endDate]
      ],
      orderBy: "modified desc",
      limit: 1
    });

    const existingAdditional = additionalRows[0];
    if (existingAdditional?.name) {
      additionalSalaryName = existingAdditional.name;
      const existingAmount = Number(existingAdditional.amount ?? 0);
      const existingDocstatus = existingAdditional.docstatus ?? 0;

      if (existingDocstatus === 0 && Math.abs(existingAmount - overtimeAmount) > 0.001) {
        await updateDoc("Additional Salary", existingAdditional.name, { amount: overtimeAmount });
      }

      if (existingDocstatus === 0) {
        await submitDoc("Additional Salary", existingAdditional.name);
      }
    } else {
      const created = await insertDoc<{ name?: string }>({
        doctype: "Additional Salary",
        employee: employeeId,
        company: employee.company,
        salary_component: "Mesai Odemesi",
        payroll_date: period.endDate,
        amount: overtimeAmount,
        overwrite_salary_structure_amount: 0
      });
      additionalSalaryName = created.name ?? "";
      createdAdditionalSalary = true;
      if (additionalSalaryName) {
        await submitDoc("Additional Salary", additionalSalaryName);
      }
    }
  }

  const existingSlipRows = await requestResourceList<SalarySlipRow>("Salary Slip", {
    fields: ["name", "docstatus"],
    filters: [
      ["employee", "=", employeeId],
      ["start_date", "=", period.startDate],
      ["end_date", "=", period.endDate]
    ],
    limit: 1
  });

  let salarySlipName = "";
  let createdSalarySlip = false;
  const existingSlip = existingSlipRows[0];
  if (existingSlip?.name) {
    salarySlipName = existingSlip.name;
  } else {
    const created = await insertDoc<{ name?: string }>({
      doctype: "Salary Slip",
      employee: employeeId,
      company: assignment.company ?? employee.company,
      posting_date: period.endDate,
      payroll_frequency: "Monthly",
      start_date: period.startDate,
      end_date: period.endDate,
      currency: assignment.currency ?? employee.salary_currency ?? "TRY",
      exchange_rate: 1,
      salary_structure: salaryStructure,
      total_working_days: 31,
      payment_days: 31
    });

    salarySlipName = created.name ?? "";
    createdSalarySlip = true;
  }

  return {
    salarySlipName,
    additionalSalaryName,
    createdSalarySlip,
    createdAdditionalSalary
  };
}

export function formatPayrollPeriod(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getOvertimeRateDescription(): string {
  return `Hafta ici: ${OVERTIME_WEEKDAY_MULTIPLIER}x | Hafta sonu/tatil: ${OVERTIME_WEEKEND_MULTIPLIER}x`;
}
