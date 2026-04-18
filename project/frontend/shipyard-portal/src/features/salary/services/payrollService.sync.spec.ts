import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestErpJsonMock } = vi.hoisted(() => ({
  requestErpJsonMock: vi.fn()
}));

vi.mock("../../../lib/erpApi", () => ({
  requestErpJson: requestErpJsonMock
}));

import { createPayrollSlipInErpnext } from "./payrollService";

describe("payrollService ERPNext sync", () => {
  beforeEach(() => {
    requestErpJsonMock.mockReset();
  });

  it("creates additional salary and salary slip records for calculated payroll", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/resource/Employee") {
        return {
          data: [{ name: "HR-EMP-00001", company: "Shipyard Demo Company", salary_currency: "TRY" }]
        };
      }

      if (path === "/resource/Salary%20Structure%20Assignment") {
        return {
          data: [
            {
              name: "HR-SSA-26-04-00001",
              salary_structure: "Shipyard Aylik Standart",
              company: "Shipyard Demo Company",
              currency: "TRY",
              from_date: "2026-03-01",
              docstatus: 1
            }
          ]
        };
      }

      if (path === "/resource/Additional%20Salary") {
        return { data: [] };
      }

      if (path === "/method/frappe.client.insert") {
        const lastCall = requestErpJsonMock.mock.calls[requestErpJsonMock.mock.calls.length - 1];
        const options = lastCall?.[2] as { body?: { doc?: string } } | undefined;
        const serializedDoc = options?.body?.doc ?? "";
        if (serializedDoc.includes("\"doctype\":\"Additional Salary\"")) {
          return { message: { name: "HR-ADS-26-04-00001" } };
        }
        if (serializedDoc.includes("\"doctype\":\"Salary Slip\"")) {
          return { message: { name: "Sal Slip/HR-EMP-00001/00001" } };
        }
        return { message: { name: "UNKNOWN" } };
      }

      if (path === "/resource/Additional%20Salary/HR-ADS-26-04-00001") {
        return {
          data: {
            doctype: "Additional Salary",
            name: "HR-ADS-26-04-00001",
            docstatus: 0
          }
        };
      }

      if (path === "/method/frappe.client.submit") {
        return { message: { name: "HR-ADS-26-04-00001", docstatus: 1 } };
      }

      if (path === "/resource/Salary%20Slip") {
        return { data: [] };
      }

      return { data: [] };
    });

    const result = await createPayrollSlipInErpnext(
      "HR-EMP-00001",
      {
        year: 2026,
        month: 3,
        label: "Mart 2026",
        startDate: "2026-03-01",
        endDate: "2026-03-31"
      },
      {
        employeeId: "HR-EMP-00001",
        period: {
          year: 2026,
          month: 3,
          label: "Mart 2026",
          startDate: "2026-03-01",
          endDate: "2026-03-31"
        },
        baseSalary: 600000,
        hourlyRate: 2666.67,
        regularHoursWorked: 0,
        overtimeWeekdayHours: 0,
        overtimeWeekendHours: 6,
        overtimeWeekdayRate: 1.5,
        overtimeWeekendRate: 2,
        overtimeWeekdayPay: 0,
        overtimeWeekendPay: 32000.04,
        totalOvertimePay: 32000.04,
        totalEarnings: 632000.04,
        totalDeductions: 0,
        netSalary: 632000.04,
        workDays: 0,
        attendanceDays: 0
      }
    );

    expect(result).toEqual({
      salarySlipName: "Sal Slip/HR-EMP-00001/00001",
      additionalSalaryName: "HR-ADS-26-04-00001",
      createdSalarySlip: true,
      createdAdditionalSalary: true
    });
  });

  it("does not update submitted additional salary amount", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/resource/Employee") {
        return {
          data: [{ name: "HR-EMP-00001", company: "Shipyard Demo Company", salary_currency: "TRY" }]
        };
      }

      if (path === "/resource/Salary%20Structure%20Assignment") {
        return {
          data: [
            {
              name: "HR-SSA-26-04-00001",
              salary_structure: "Shipyard Aylik Standart",
              company: "Shipyard Demo Company",
              currency: "TRY",
              from_date: "2026-03-01",
              docstatus: 1
            }
          ]
        };
      }

      if (path === "/resource/Additional%20Salary") {
        return {
          data: [
            {
              name: "HR-ADS-26-04-00001",
              docstatus: 1,
              amount: 32000.04
            }
          ]
        };
      }

      if (path === "/resource/Salary%20Slip") {
        return {
          data: [
            {
              name: "Sal Slip/HR-EMP-00001/00001",
              docstatus: 1
            }
          ]
        };
      }

      return { data: [] };
    });

    const result = await createPayrollSlipInErpnext(
      "HR-EMP-00001",
      {
        year: 2026,
        month: 3,
        label: "Mart 2026",
        startDate: "2026-03-01",
        endDate: "2026-03-31"
      },
      {
        employeeId: "HR-EMP-00001",
        period: {
          year: 2026,
          month: 3,
          label: "Mart 2026",
          startDate: "2026-03-01",
          endDate: "2026-03-31"
        },
        baseSalary: 600000,
        hourlyRate: 2666.67,
        regularHoursWorked: 0,
        overtimeWeekdayHours: 0,
        overtimeWeekendHours: 6,
        overtimeWeekdayRate: 1.5,
        overtimeWeekendRate: 2,
        overtimeWeekdayPay: 0,
        overtimeWeekendPay: 32000.0,
        totalOvertimePay: 32000.0,
        totalEarnings: 632000,
        totalDeductions: 0,
        netSalary: 632000,
        workDays: 0,
        attendanceDays: 0
      }
    );

    expect(result).toEqual({
      salarySlipName: "Sal Slip/HR-EMP-00001/00001",
      additionalSalaryName: "HR-ADS-26-04-00001",
      createdSalarySlip: false,
      createdAdditionalSalary: false
    });

    expect(
      requestErpJsonMock.mock.calls.some(
        (call) =>
          call[0] === "/resource/Additional%20Salary/HR-ADS-26-04-00001" &&
          call[2] &&
          typeof call[2] === "object" &&
          "method" in call[2] &&
          (call[2] as { method?: string }).method === "PUT"
      )
    ).toBe(false);
  });
});
