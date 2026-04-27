import { requestErpJson } from "../../../lib/erpApi";

type LeaveTypeSettingsMessage = {
  leave_types_text?: string;
  leave_types?: string[];
  departments_text?: string;
  departments?: string[];
  auto_create_leave_allocation?: boolean | number;
  default_leave_allocation_days?: number;
};

type OperationalSettingsMessage = {
  overtime_default_hours?: number;
  attendance_lookback_days?: number;
  dashboard_critical_stock_limit?: number;
  stock_warning_multiplier?: number;
  purchase_invoice_page_size?: number;
  stock_list_page_size?: number;
  team_list_page_size?: number;
  zimmet_list_page_size?: number;
  payroll_standard_monthly_hours?: number;
  hr_required_document_types_text?: string;
  hr_required_document_types?: string[];
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

type OperationalSettingsResponse = {
  message?: OperationalSettingsMessage;
};

export type LeaveTypeSettingsState = {
  leaveTypesText: string;
  leaveTypes: string[];
  departmentsText: string;
  departments: string[];
  autoCreateLeaveAllocation: boolean;
  defaultLeaveAllocationDays: number;
};

export type OperationalSettingsState = {
  overtimeDefaultHours: number;
  attendanceLookbackDays: number;
  dashboardCriticalStockLimit: number;
  stockWarningMultiplier: number;
  purchaseInvoicePageSize: number;
  stockListPageSize: number;
  teamListPageSize: number;
  zimmetListPageSize: number;
  payrollStandardMonthlyHours: number;
  hrRequiredDocumentTypesText: string;
  hrRequiredDocumentTypes: string[];
};

const DEFAULT_OPERATIONAL_SETTINGS: OperationalSettingsState = {
  overtimeDefaultHours: 2,
  attendanceLookbackDays: 30,
  dashboardCriticalStockLimit: 5,
  stockWarningMultiplier: 1.5,
  purchaseInvoicePageSize: 20,
  stockListPageSize: 250,
  teamListPageSize: 250,
  zimmetListPageSize: 250,
  payrollStandardMonthlyHours: 225,
  hrRequiredDocumentTypesText: "Kimlik Belgesi\nIs Sozlesmesi\nSaglik Raporu\nISG Egitim Belgesi\nMesleki Sertifika",
  hrRequiredDocumentTypes: ["Kimlik Belgesi", "Is Sozlesmesi", "Saglik Raporu", "ISG Egitim Belgesi", "Mesleki Sertifika"]
};

export async function fetchLeaveTypeSettings(): Promise<LeaveTypeSettingsState> {
  try {
    const payload = await requestErpJson<LeaveTypeSettingsResponse>(
      "/method/shipyard_app.platform.api.get_leave_type_settings"
    );
    const message = payload.message ?? {};
    const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types.filter(Boolean) : [];
    const departments = Array.isArray(message.departments) ? message.departments.filter(Boolean) : [];

    return {
      leaveTypesText: message.leave_types_text ?? leaveTypes.join("\n"),
      leaveTypes,
      departmentsText: message.departments_text ?? departments.join("\n"),
      departments,
      autoCreateLeaveAllocation: Number(message.auto_create_leave_allocation ?? 0) === 1 || message.auto_create_leave_allocation === true,
      defaultLeaveAllocationDays: Number(message.default_leave_allocation_days ?? 14) > 0 ? Number(message.default_leave_allocation_days) : 14
    };
  } catch {
    return {
      leaveTypesText: "",
      leaveTypes: [],
      departmentsText: "",
      departments: [],
      autoCreateLeaveAllocation: false,
      defaultLeaveAllocationDays: 14
    };
  }
}

export async function saveLeaveTypeSettings(
  leaveTypesText: string,
  departmentsText: string,
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
        departments_text: departmentsText,
        auto_create_leave_allocation: autoCreateLeaveAllocation ? 1 : 0,
        default_leave_allocation_days: defaultLeaveAllocationDays
      }
    }
  );

  const message = payload.message ?? {};
  const leaveTypes = Array.isArray(message.leave_types) ? message.leave_types.filter(Boolean) : [];
  const departments = Array.isArray(message.departments) ? message.departments.filter(Boolean) : [];

  return {
    leaveTypesText: message.leave_types_text ?? leaveTypes.join("\n"),
    leaveTypes,
    departmentsText: message.departments_text ?? departments.join("\n"),
    departments,
    autoCreateLeaveAllocation: Number(message.auto_create_leave_allocation ?? 0) === 1 || message.auto_create_leave_allocation === true,
    defaultLeaveAllocationDays: Number(message.default_leave_allocation_days ?? 14) > 0 ? Number(message.default_leave_allocation_days) : 14
  };
}

function toOperationalSettingsState(message: OperationalSettingsMessage | undefined): OperationalSettingsState {
  const configuredRequiredDocumentTypes = Array.isArray(message?.hr_required_document_types)
    ? message?.hr_required_document_types.filter(Boolean)
    : [];
  const normalizedRequiredDocumentTypes =
    configuredRequiredDocumentTypes.length > 0
      ? configuredRequiredDocumentTypes
      : DEFAULT_OPERATIONAL_SETTINGS.hrRequiredDocumentTypes;

  return {
    overtimeDefaultHours:
      Number(message?.overtime_default_hours ?? DEFAULT_OPERATIONAL_SETTINGS.overtimeDefaultHours) > 0
        ? Number(message?.overtime_default_hours ?? DEFAULT_OPERATIONAL_SETTINGS.overtimeDefaultHours)
        : DEFAULT_OPERATIONAL_SETTINGS.overtimeDefaultHours,
    attendanceLookbackDays:
      Number(message?.attendance_lookback_days ?? DEFAULT_OPERATIONAL_SETTINGS.attendanceLookbackDays) > 0
        ? Number(message?.attendance_lookback_days ?? DEFAULT_OPERATIONAL_SETTINGS.attendanceLookbackDays)
        : DEFAULT_OPERATIONAL_SETTINGS.attendanceLookbackDays,
    dashboardCriticalStockLimit:
      Number(message?.dashboard_critical_stock_limit ?? DEFAULT_OPERATIONAL_SETTINGS.dashboardCriticalStockLimit) > 0
        ? Number(message?.dashboard_critical_stock_limit ?? DEFAULT_OPERATIONAL_SETTINGS.dashboardCriticalStockLimit)
        : DEFAULT_OPERATIONAL_SETTINGS.dashboardCriticalStockLimit,
    stockWarningMultiplier:
      Number(message?.stock_warning_multiplier ?? DEFAULT_OPERATIONAL_SETTINGS.stockWarningMultiplier) >= 1.1
        ? Number(message?.stock_warning_multiplier ?? DEFAULT_OPERATIONAL_SETTINGS.stockWarningMultiplier)
        : DEFAULT_OPERATIONAL_SETTINGS.stockWarningMultiplier,
    purchaseInvoicePageSize:
      Number(message?.purchase_invoice_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.purchaseInvoicePageSize) > 0
        ? Number(message?.purchase_invoice_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.purchaseInvoicePageSize)
        : DEFAULT_OPERATIONAL_SETTINGS.purchaseInvoicePageSize,
    stockListPageSize:
      Number(message?.stock_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.stockListPageSize) > 0
        ? Number(message?.stock_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.stockListPageSize)
        : DEFAULT_OPERATIONAL_SETTINGS.stockListPageSize,
    teamListPageSize:
      Number(message?.team_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.teamListPageSize) > 0
        ? Number(message?.team_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.teamListPageSize)
        : DEFAULT_OPERATIONAL_SETTINGS.teamListPageSize,
    zimmetListPageSize:
      Number(message?.zimmet_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.zimmetListPageSize) > 0
        ? Number(message?.zimmet_list_page_size ?? DEFAULT_OPERATIONAL_SETTINGS.zimmetListPageSize)
        : DEFAULT_OPERATIONAL_SETTINGS.zimmetListPageSize,
    payrollStandardMonthlyHours:
      Number(
        message?.payroll_standard_monthly_hours ?? DEFAULT_OPERATIONAL_SETTINGS.payrollStandardMonthlyHours
      ) > 0
        ? Number(
            message?.payroll_standard_monthly_hours ?? DEFAULT_OPERATIONAL_SETTINGS.payrollStandardMonthlyHours
          )
        : DEFAULT_OPERATIONAL_SETTINGS.payrollStandardMonthlyHours,
    hrRequiredDocumentTypesText:
      message?.hr_required_document_types_text?.trim() || normalizedRequiredDocumentTypes.join("\n"),
    hrRequiredDocumentTypes: normalizedRequiredDocumentTypes
  };
}

export async function fetchOperationalSettings(): Promise<OperationalSettingsState> {
  try {
    const payload = await requestErpJson<OperationalSettingsResponse>(
      "/method/shipyard_app.platform.api.get_operational_settings"
    );
    return toOperationalSettingsState(payload.message);
  } catch {
    return DEFAULT_OPERATIONAL_SETTINGS;
  }
}

export async function saveOperationalSettings(input: OperationalSettingsState): Promise<OperationalSettingsState> {
  const payload = await requestErpJson<OperationalSettingsResponse>(
    "/method/shipyard_app.platform.api.save_operational_settings",
    undefined,
    {
      method: "POST",
      body: {
        overtime_default_hours: input.overtimeDefaultHours,
        attendance_lookback_days: input.attendanceLookbackDays,
        dashboard_critical_stock_limit: input.dashboardCriticalStockLimit,
        stock_warning_multiplier: input.stockWarningMultiplier,
        purchase_invoice_page_size: input.purchaseInvoicePageSize,
        stock_list_page_size: input.stockListPageSize,
        team_list_page_size: input.teamListPageSize,
        zimmet_list_page_size: input.zimmetListPageSize,
        payroll_standard_monthly_hours: input.payrollStandardMonthlyHours,
        hr_required_document_types_text: input.hrRequiredDocumentTypesText
      }
    }
  );

  return toOperationalSettingsState(payload.message);
}
