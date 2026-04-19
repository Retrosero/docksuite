import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OvertimeFilterState } from "../types";

const { MockErpRequestError, requestErpJsonMock, canReadDoctypeMock } = vi.hoisted(() => {
  class HoistedErpRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }

  return {
    MockErpRequestError: HoistedErpRequestError,
    requestErpJsonMock: vi.fn(),
    canReadDoctypeMock: vi.fn()
  };
});

vi.mock("../../../lib/erpApi", () => ({
  ErpRequestError: MockErpRequestError,
  requestErpJson: requestErpJsonMock,
  canReadDoctype: canReadDoctypeMock
}));

import { createBulkOvertimeRequests, createOvertimeRequest, fetchOvertimeData } from "./overtimeService";

const EMPTY_FILTERS: OvertimeFilterState = {
  employee: "",
  status: "",
  startDate: "",
  endDate: "",
  searchText: ""
};

describe("overtimeService", () => {
  beforeEach(() => {
    requestErpJsonMock.mockReset();
    canReadDoctypeMock.mockReset();
    canReadDoctypeMock.mockResolvedValue(true);
  });

  it("limits employee view to the logged-in employee records", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/resource/Overtime%20Request") {
        return {
          data: [
            {
              name: "OT-001",
              employee: "EMP-0001",
              employee_name: "Ali Vural",
              date: "2026-04-10",
              hours: 3,
              reason: "Kaynak montaji",
              status: "Approved",
              workflow_state: "Approved",
              modified: "2026-04-10 18:00:00"
            },
            {
              name: "OT-002",
              employee: "EMP-0002",
              employee_name: "Ece Demir",
              date: "2026-04-10",
              hours: 2,
              reason: "Vardiya devri",
              status: "Open",
              workflow_state: "Open",
              modified: "2026-04-10 19:00:00"
            }
          ]
        };
      }

      if (path === "/resource/Employee") {
        return {
          data: [
            { name: "EMP-0001", employee_name: "Ali Vural", user_id: "ali@shipyard.local" },
            { name: "EMP-0002", employee_name: "Ece Demir", user_id: "ece@shipyard.local" }
          ]
        };
      }

      if (path === "/method/frappe.auth.get_logged_user") {
        return { message: "ali@shipyard.local" };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const result = await fetchOvertimeData("employee", EMPTY_FILTERS);

    expect(result.activeEmployeeId).toBe("EMP-0001");
    expect(result.requests).toHaveLength(1);
    expect(result.requests[0]?.name).toBe("OT-001");
    expect(result.summary).toEqual({
      totalRequests: 1,
      pendingRequests: 0,
      approvedRequests: 1,
      rejectedRequests: 0,
      totalHours: 3,
      approvedHours: 3
    });
  });

  it("sorts overtime rows by date descending", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/resource/Overtime%20Request") {
        return {
          data: [
            {
              name: "OT-001",
              employee: "EMP-0001",
              employee_name: "Ali Vural",
              date: "2026-04-10",
              hours: 3,
              reason: "Kaynak montaji",
              status: "Approved",
              workflow_state: "Approved",
              modified: "2026-04-10 18:00:00"
            },
            {
              name: "OT-002",
              employee: "EMP-0002",
              employee_name: "Ece Demir",
              date: "2026-04-13",
              hours: 2,
              reason: "Vardiya devri",
              status: "Open",
              workflow_state: "Open",
              modified: "2026-04-13 19:00:00"
            },
            {
              name: "OT-003",
              employee: "EMP-0003",
              employee_name: "Mert Ak",
              date: "2026-04-11",
              hours: 4,
              reason: "Sevk hazirligi",
              status: "Open",
              workflow_state: "Open",
              modified: "2026-04-11 16:00:00"
            }
          ]
        };
      }

      if (path === "/resource/Employee") {
        return {
          data: [
            { name: "EMP-0001", employee_name: "Ali Vural", user_id: "ali@shipyard.local" },
            { name: "EMP-0002", employee_name: "Ece Demir", user_id: "ece@shipyard.local" }
          ]
        };
      }

      if (path === "/method/frappe.auth.get_logged_user") {
        return { message: "manager@shipyard.local" };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const result = await fetchOvertimeData("manager", EMPTY_FILTERS);

    expect(result.requests.map((row) => row.name)).toEqual(["OT-002", "OT-003", "OT-001"]);
  });

  it("posts a new overtime request with open status", async () => {
    requestErpJsonMock.mockResolvedValue({ message: "ok" });

    await createOvertimeRequest({
      employee: "EMP-0100",
      date: "2026-04-18",
      hours: 4.5,
      reason: "Acil teslim hazirligi"
    });

    expect(requestErpJsonMock).toHaveBeenCalledWith(
      "/resource/Overtime Request",
      undefined,
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({
          doctype: "Overtime Request",
          employee: "EMP-0100",
          date: "2026-04-18",
          hours: 4.5,
          reason: "Acil teslim hazirligi",
          status: "Open"
        })
      })
    );
  });

  it("falls back to resource create when bulk overtime endpoint is missing", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/method/shipyard_app.overtime_api.create_bulk_overtime_requests") {
        throw new MockErpRequestError("Not Found", 404);
      }

      if (path === "/resource/Overtime Request") {
        return {
          data: {
            name: "OT-NEW-001"
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const result = await createBulkOvertimeRequests({
      employeeIds: ["EMP-0001", "EMP-0002"],
      date: "2026-04-18",
      hours: 4.5,
      reason: "Acil teslim hazirligi"
    });

    expect(result.created_count).toBe(2);
    expect(result.failed_count).toBe(0);
    const resourceCreateCalls = requestErpJsonMock.mock.calls.filter(([path]) => path === "/resource/Overtime Request");
    expect(resourceCreateCalls).toHaveLength(2);
  });

  it("falls back to personnel_api employee list when Employee resource fails", async () => {
    requestErpJsonMock.mockImplementation(async (path: string) => {
      if (path === "/resource/Overtime%20Request") {
        return { data: [] };
      }

      if (path === "/resource/Employee") {
        throw new MockErpRequestError("Expectation Failed", 417);
      }

      if (path === "/method/shipyard_app.personnel_api.list_employees") {
        return {
          message: {
            items: [
              { name: "EMP-0001", employee_name: "Ali Vural" },
              { name: "EMP-0002", employee_name: "Ece Demir" }
            ],
            total: 2
          }
        };
      }

      if (path === "/method/frappe.auth.get_logged_user") {
        return { message: "manager@shipyard.local" };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const result = await fetchOvertimeData("manager", EMPTY_FILTERS);

    expect(result.employeeOptions).toEqual([
      { id: "EMP-0001", label: "Ali Vural" },
      { id: "EMP-0002", label: "Ece Demir" }
    ]);
  });
});
