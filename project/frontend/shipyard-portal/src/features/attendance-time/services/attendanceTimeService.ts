import { requestErpJson } from "../../../lib/erpApi";
import { fetchActiveEmployeeOptions } from "../../salary/services/salaryService";
import type {
  AttendanceTimeEmployeeOption,
  BulkAttendanceTimeInput,
  BulkAttendanceTimeResult,
  MonthlyPayrollPreview
} from "../types";

type FrappeMethodResponse<T> = {
  message?: T;
};

export async function fetchAttendanceTimeEmployeeOptions(): Promise<AttendanceTimeEmployeeOption[]> {
  const rows = await fetchActiveEmployeeOptions();
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function saveBulkAttendanceTimes(input: BulkAttendanceTimeInput): Promise<BulkAttendanceTimeResult> {
  const payload = {
    employee_ids: input.employeeIds,
    attendance_date: input.attendanceDate,
    in_time: input.inTime,
    out_time: input.outTime,
    shift: input.shift,
    status: input.status ?? "Present"
  };

  const response = await requestErpJson<FrappeMethodResponse<BulkAttendanceTimeResult>>(
    "/method/shipyard_app.attendance_payroll_api.bulk_upsert_attendance_times",
    undefined,
    {
      method: "POST",
      body: {
        payload: JSON.stringify(payload)
      },
      timeoutMs: 12000
    }
  );

  if (!response.message) {
    throw new Error("Saat kaydi alinamadi.");
  }
  return response.message;
}

export async function fetchMonthlyPayrollPreview(
  year: number,
  month: number,
  employeeIds: string[]
): Promise<MonthlyPayrollPreview> {
  const payload = {
    year,
    month,
    employee_ids: employeeIds
  };

  const response = await requestErpJson<FrappeMethodResponse<MonthlyPayrollPreview>>(
    "/method/shipyard_app.attendance_payroll_api.get_monthly_attendance_payroll_preview",
    undefined,
    {
      method: "POST",
      body: {
        payload: JSON.stringify(payload)
      },
      timeoutMs: 15000
    }
  );

  if (!response.message) {
    throw new Error("Bordro onizleme verisi alinamadi.");
  }
  return response.message;
}
