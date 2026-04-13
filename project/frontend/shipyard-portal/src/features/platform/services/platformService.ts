import { tenantConfig } from "../../../config/tenant";
import type { PlatformContextResponse } from "../types";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string) {
  return `${trimTrailingSlash(tenantConfig.erpApiBaseUrl)}${path}`;
}

export async function fetchPlatformContext(): Promise<PlatformContextResponse | null> {
  const response = await fetch(
    buildApiUrl("/method/shipyard_app.platform.api.get_platform_context"),
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Frappe-Site-Name": tenantConfig.erpSiteName
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    message?: PlatformContextResponse;
  };
  return payload.message ?? null;
}

