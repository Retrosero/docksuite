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
            status: "open",
            statusLabel: "Onay bekliyor"
          }
        ],
        summary: {
          totalHours: 8,
          approvedHours: 0,
          pendingHours: 8,
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

  it("uses approved overtime requests in selected month when attendance overtime is missing", () => {
    const result = calculatePayroll({
      employeeId: "HR-EMP-00001",
      period: {
        year: 2026,
        month: 3,
        label: "Mart 2026",
        startDate: "2026-03-01",
        endDate: "2026-03-31"
      },
      salaryInfo: {
        name: "EMP-HR-EMP-00001",
        employee: "HR-EMP-00001",
        employee_name: "Serhan",
        baseSalary: 120000,
        currency: "TRY",
        payGrade: "Manuel Tanim",
        effectiveFrom: null
      },
      workHistory: {
        employeeId: "HR-EMP-00001",
        period: "2026-03",
        items: [],
        summary: {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          totalHoursWorked: 0,
          regularHours: 0,
          overtimeHours: 0,
          avgHoursPerDay: 0
        }
      },
      overtimeHistory: {
        employeeId: "HR-EMP-00001",
        items: [
          {
            id: "OT-MAR-WD",
            date: "2026-03-10",
            hours: 5,
            reason: "Teslim hazirligi",
            status: "approved",
            statusLabel: "Onaylandi"
          },
          {
            id: "OT-MAR-WE",
            date: "2026-03-15",
            hours: 3,
            reason: "Hafta sonu destek",
            status: "approved",
            statusLabel: "Onaylandi"
          },
          {
            id: "OT-APR",
            date: "2026-04-02",
            hours: 9,
            reason: "Farkli ay mesaisi",
            status: "approved",
            statusLabel: "Onaylandi"
          }
        ],
        summary: {
          totalHours: 17,
          approvedHours: 17,
          pendingHours: 0,
          rejectedHours: 0,
          totalPay: 0
        }
      }
    });

    // Hourly rate: 120000 / 225 = 533.33
    // Weekday overtime pay: 5 * 533.33 * 1.5 = 4000
    // Weekend overtime pay: 3 * 533.33 * 2 = 3200
    expect(result.overtimeWeekdayHours).toBe(5);
    expect(result.overtimeWeekendHours).toBe(3);
    expect(result.totalOvertimePay).toBe(7200);
    expect(result.netSalary).toBe(127200);
  });
});
