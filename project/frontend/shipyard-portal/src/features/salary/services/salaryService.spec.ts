import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestErpJsonMock } = vi.hoisted(() => ({
  requestErpJsonMock: vi.fn()
}));

vi.mock("../../../lib/erpApi", () => ({
  requestErpJson: requestErpJsonMock
}));

import { fetchSalaryInfo, updateEmployeeSalary } from "./salaryService";

describe("salaryService", () => {
  beforeEach(() => {
    requestErpJsonMock.mockReset();
  });

  it("returns salary structure assignment when available", async () => {
    requestErpJsonMock.mockResolvedValueOnce({
      data: [
        {
          name: "SSA-0001",
          employee: "EMP-0001",
          employee_name: "Ali Vural",
          salary_structure: "Mavi Yaka",
          base: 42000,
          currency: "TRY",
          effective_from: "2026-04-01"
        }
      ]
    });

    const result = await fetchSalaryInfo("EMP-0001");

    expect(result).toEqual({
      name: "SSA-0001",
      employee: "EMP-0001",
      employee_name: "Ali Vural",
      baseSalary: 42000,
      currency: "TRY",
      payGrade: "Mavi Yaka",
      effectiveFrom: "2026-04-01"
    });
    expect(requestErpJsonMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to employee custom salary field when assignment is not available", async () => {
    requestErpJsonMock
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            name: "EMP-0002",
            employee_name: "Zeynep Kaya",
            shipyard_monthly_base_salary: 36500,
            salary_currency: "TRY"
          }
        ]
      });

    const result = await fetchSalaryInfo("EMP-0002");

    expect(result).toEqual({
      name: "EMP-EMP-0002",
      employee: "EMP-0002",
      employee_name: "Zeynep Kaya",
      baseSalary: 36500,
      currency: "TRY",
      payGrade: "Manuel Tanim",
      effectiveFrom: null
    });
    expect(requestErpJsonMock).toHaveBeenCalledTimes(2);
  });

  it("updates employee salary through employee resource and re-reads salary info", async () => {
    requestErpJsonMock
      .mockResolvedValueOnce({ data: { name: "EMP-0003" } })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            name: "EMP-0003",
            employee_name: "Deniz Aksoy",
            shipyard_monthly_base_salary: 51000,
            salary_currency: "USD"
          }
        ]
      });

    const result = await updateEmployeeSalary("EMP-0003", 51000, "USD");

    expect(requestErpJsonMock).toHaveBeenNthCalledWith(
      1,
      "/resource/Employee/EMP-0003",
      undefined,
      expect.objectContaining({
        method: "PUT",
        body: {
          shipyard_monthly_base_salary: 51000,
          salary_currency: "USD"
        }
      })
    );
    expect(result?.baseSalary).toBe(51000);
    expect(result?.currency).toBe("USD");
  });
});
