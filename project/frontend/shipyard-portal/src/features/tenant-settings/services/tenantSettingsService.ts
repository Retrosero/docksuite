import { requestErpJson } from "../../../lib/erpApi";

type LeaveTypeSettingsMessage = {
  leave_types_text?: string;
  leave_types?: string[];
  auto_create_leave_allocation?: boolean | number;
  default_leave_allocation_days?: number;
};

type LeaveTypeSettingsResponse = {
  message?: LeaveTypeSettingsMessage;
};

type SaveLeaveTypeSettingsResponse = {
  message?: LeaveTypeSettingsMessage & {
    synced?: Array<{
      name?: string;
      created?: boolean;
    }>;
  };
};

export type LeaveTypeSettingsState = {
  leaveTypesText: string;
  leaveTypes: string[];
  autoCreateLeaveAllocation: boolean;
  defaultLeaveAllocationDays: number;
};

export async function fetchLeaveTypeSettings(): Promise<LeaveTypeSettingsState> {
  try {
    const payload = await requestErpJson<LeaveTypeSettingsResponse>(
      "/method/shipyard_app.platform.api.get_leave_type_settings"
    );
    const message = payload.message ?? {};
    const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types.filter(Boolean) : [];

    return {
      leaveTypesText: message.leave_types_text ?? leaveTypes.join("\n"),
      leaveTypes,
      autoCreateLeaveAllocation: Number(message.auto_create_leave_allocation ?? 0) === 1 || message.auto_create_leave_allocation === true,
      defaultLeaveAllocationDays: Number(message.default_leave_allocation_days ?? 14) > 0 ? Number(message.default_leave_allocation_days) : 14
    };
  } catch {
    return {
      leaveTypesText: "",
      leaveTypes: [],
      autoCreateLeaveAllocation: false,
      defaultLeaveAllocationDays: 14
    };
  }
}

export async function saveLeaveTypeSettings(
  leaveTypesText: string,
  autoCreateLeaveAllocation: boolean,
  defaultLeaveAllocationDays: number
): Promise<LeaveTypeSettingsState> {
  const payload = await requestErpJson<SaveLeaveTypeSettingsResponse>(
    "/method/shipyard_app.platform.api.save_leave_type_settings",
    undefined,
    {
      method: "POST",
      body: {
        leave_types_text: leaveTypesText,
        auto_create_leave_allocation: autoCreateLeaveAllocation ? 1 : 0,
        default_leave_allocation_days: defaultLeaveAllocationDays
      }
    }
  );

  const message = payload.message ?? {};
  const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types.filter(Boolean) : [];

  return {
    leaveTypesText: message.leave_types_text ?? leaveTypes.join("\n"),
    leaveTypes,
    autoCreateLeaveAllocation: Number(message.auto_create_leave_allocation ?? 0) === 1 || message.auto_create_leave_allocation === true,
    defaultLeaveAllocationDays: Number(message.default_leave_allocation_days ?? 14) > 0 ? Number(message.default_leave_allocation_days) : 14
  };
}
