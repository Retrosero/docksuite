import { requestErpJson } from "../../../lib/erpApi";

type LeaveTypeSettingsMessage = {
  leave_types_text?: string;
  leave_types?: string[];
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
      leaveTypes
    };
  } catch {
    return {
      leaveTypesText: "",
      leaveTypes: []
    };
  }
}

export async function saveLeaveTypeSettings(leaveTypesText: string): Promise<LeaveTypeSettingsState> {
  const payload = await requestErpJson<SaveLeaveTypeSettingsResponse>(
    "/method/shipyard_app.platform.api.save_leave_type_settings",
    undefined,
    {
      method: "POST",
      body: {
        leave_types_text: leaveTypesText
      }
    }
  );

  const message = payload.message ?? {};
  const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types.filter(Boolean) : [];

  return {
    leaveTypesText: message.leave_types_text ?? leaveTypes.join("\n"),
    leaveTypes
  };
}
