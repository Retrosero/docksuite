import { tenantConfig } from "../../../config/tenant";
import { requestErpJson } from "../../../lib/erpApi";
import type { PlatformContextResponse } from "../types";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string) {
  return `${trimTrailingSlash(tenantConfig.erpApiBaseUrl)}${path}`;
}

export async function fetchPlatformContext(): Promise<PlatformContextResponse | null> {
  try {
    const payload = await requestErpJson<{ message?: PlatformContextResponse }>(
      "/method/shipyard_app.platform.api.get_platform_context"
    );
    return payload.message ?? null;
  } catch {
    return null;
  }
}

