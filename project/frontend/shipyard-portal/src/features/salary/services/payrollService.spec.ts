import { describe, expect, it } from "vitest";
import { calculatePayroll } from "./payrollService";

describe("payrollService", () => {
  it("calculates overtime split and net salary from work history", () => {
    const result = calculatePayroll({
      employeeId: "EMP-0001",
      period: {
        year: 2026,
        month: 4,
        label: "Nisan 2026",
        startDate: "2026-04-01",
        endDate: "2026-04-30"
      },
      salaryInfo: {
        name: "SSA-001",
        employee: "EMP-0001",
        employee_name: "Ali Vural",
        baseSalary: 45000,
        currency: "TRY",
        payGrade: "Mavi Yaka",
        effectiveFrom: "2026-04-01"
      },
      workHistory: {
        employeeId: "EMP-0001",
        period: "2026-04",
        items: [
          {
            id: "ATT-01",
            date: "2026-04-06",
            checkin: "2026-04-06T08:00:00",
            checkout: "2026-04-06T18:00:00",
            hoursWorked: 100,
            shiftType: "Gunduz",
            status: "Present"
          },
          {
            id: "ATT-02",
            date: "2026-04-07",
            checkin: "2026-04-07T08:00:00",
            checkout: "2026-04-07T18:00:00",
            hoursWorked: 100,
            shiftType: "Gunduz",
            status: "Present"
          },
          {
            id: "ATT-03",
            date: "2026-04-12",
            checkin: "2026-04-12T08:00:00",
            checkout: "2026-04-12T18:00:00",
            hoursWorked: 40,
            shiftType: "Hafta Sonu",
            status: "Present"
          }
        ],
        summary: {
          totalDays: 3,
          presentDays: 3,
          absentDays: 0,
          totalHoursWorked: 240,
          regularHours: 225,
          overtimeHours: 15,
          avgHoursPerDay: 80
        }
      },
      overtimeHistory: {
        employeeId: "EMP-0001",
        items: [
          {
            id: "OT-01",
            date: "2026-04-12",
            hours: 8,
            reason: "Teslim hazirligi",
            status: "approved",
            statusLabel: "Onaylandi"
          }
        ],
        summary: {
          totalHours: 8,
          approvedHours: 8,
          pendingHours: 0,
          rejectedHours: 0,
          totalPay: 0
        }
      }
    });

    expect(result.hourlyRate).toBe(200);
    expect(result.regularHoursWorked).toBe(225);
    expect(result.overtimeWeekdayHours).toBe(12.5);
    expect(result.overtimeWeekendHours).toBe(2.5);
    expect(result.totalOvertimePay).toBe(4750);
    expect(result.totalEarnings).toBe(49750);
    expect(result.netSalary).toBe(49750);
  });

  it("returns zeroed payroll values when salary and work data are missing", () => {
    const result = calculatePayroll({
      employeeId: "EMP-0002",
      period: {
        year: 2026,
        month: 4,
        label: "Nisan 2026",
        startDate: "2026-04-01",
        endDate: "2026-04-30"
      },
      salaryInfo: null,
      workHistory: null,
      overtimeHistory: null
    });

    expect(result.baseSalary).toBe(0);
    expect(result.totalEarnings).toBe(0);
    expect(result.netSalary).toBe(0);
    expect(result.attendanceDays).toBe(0);
  });
});
