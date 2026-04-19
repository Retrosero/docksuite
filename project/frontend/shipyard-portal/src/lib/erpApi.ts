import { tenantConfig } from "../config/tenant";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: Record<string, unknown>;
  timeoutMs?: number;
  cacheKeySuffix?: string | number | null;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type ErrorPayload = {
  message?: string | { message?: string } | null;
  exc_type?: string;
  _server_messages?: string;
};

const DEFAULT_TIMEOUT_MS = 9000;
const RESPONSE_CACHE_TTL_MS = 4000;
const BACKEND_PROBE_TIMEOUT_MS = 3000;
const BACKEND_PROBE_SUCCESS_TTL_MS = 5000;
const BACKEND_PROBE_FAILURE_TTL_MS = 5000;

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
let backendAvailableUntil = 0;
let backendUnavailableUntil = 0;
let backendProbePromise: Promise<void> | null = null;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

function isGatewayFailure(status: number) {
  return status === 502 || status === 503 || status === 504;
}

function markBackendAvailable() {
  const now = Date.now();
  backendAvailableUntil = now + BACKEND_PROBE_SUCCESS_TTL_MS;
  backendUnavailableUntil = 0;
}

function markBackendUnavailable() {
  const now = Date.now();
  backendUnavailableUntil = now + BACKEND_PROBE_FAILURE_TTL_MS;
  backendAvailableUntil = 0;
}

function createBackendUnavailableError() {
  return new ErpRequestError("ERPNext backendine su anda ulasilamiyor. Backend calisiyor mu ve proxy hedefi dogru mu kontrol edin.", 503);
}

async function probeBackendAvailability() {
  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => {
    controller.abort();
  }, BACKEND_PROBE_TIMEOUT_MS);

  try {
    // Guest-safe health probe to avoid permission-related 417 noise on login screen.
    const response = await fetch(buildApiUrl("/method/frappe.auth.get_logged_user"), {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "X-Frappe-Site-Name": tenantConfig.erpSiteName
      }
    });

    if (isGatewayFailure(response.status)) {
      throw createBackendUnavailableError();
    }

    markBackendAvailable();
  } catch (error) {
    markBackendUnavailable();

    if (error instanceof DOMException && error.name === "AbortError") {
      throw createBackendUnavailableError();
    }

    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw createBackendUnavailableError();
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutHandle);
  }
}

async function ensureBackendAvailable() {
  const now = Date.now();

  if (now < backendUnavailableUntil) {
    throw createBackendUnavailableError();
  }

  if (now < backendAvailableUntil) {
    return;
  }

  if (!backendProbePromise) {
    backendProbePromise = probeBackendAvailability().finally(() => {
      backendProbePromise = null;
    });
  }

  await backendProbePromise;
}

function markBackendFailureFromResponse(status: number) {
  if (isGatewayFailure(status)) {
    markBackendUnavailable();
  }
}

function markBackendFailureFromError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    markBackendUnavailable();
    return true;
  }

  if (error instanceof TypeError) {
    markBackendUnavailable();
    return true;
  }

  return false;
}

function buildCacheKey(path: string, params: URLSearchParams | undefined, options: RequestOptions) {
  const method = options.method ?? "GET";
  const bodyKey = options.body ? JSON.stringify(options.body) : "";
  const cacheKeySuffix = options.cacheKeySuffix !== null && options.cacheKeySuffix !== undefined ? String(options.cacheKeySuffix) : "";
  return `${method}:${buildApiUrl(path, params)}:${bodyKey}:${cacheKeySuffix}`;
}

function getCsrfToken(): string | null {
  const cookieText = document.cookie || "";
  const parts = cookieText.split(";").map((item) => item.trim());

  for (const part of parts) {
    if (part.startsWith("sid=")) {
      return null; // Session cookie - no CSRF needed for guest
    }
    if (part.startsWith("csrf_token=")) {
      return decodeURIComponent(part.slice("csrf_token=".length));
    }
  }

  // Try to get from meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute("content");
  }

  return null;
}

function toFormBody(body: Record<string, unknown>) {
  return new URLSearchParams(
    Object.entries(body).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (value !== undefined && value !== null && String(value).trim().length > 0) {
        accumulator[key] = String(value);
      }
      return accumulator;
    }, {})
  );
}

function parseServerMessage(payload: ErrorPayload) {
  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message.trim();
  }

  if (typeof payload.message === "object" && payload.message?.message) {
    return payload.message.message;
  }

  const encodedMessages = payload._server_messages;

  if (!encodedMessages) {
    return null;
  }

  try {
    const outer = JSON.parse(encodedMessages) as string[];

    for (const entry of outer) {
      try {
        const parsed = JSON.parse(entry) as { message?: string };
        if (parsed.message && parsed.message.trim().length > 0) {
          return parsed.message.trim();
        }
      } catch {
        if (typeof entry === "string" && entry.trim().length > 0) {
          return entry.trim();
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export class ErpRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requestErpJson<T>(path: string, params?: URLSearchParams, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const requestBody = method !== "GET" && options.body ? toFormBody(options.body) : null;
  const cacheKey = method === "GET" ? buildCacheKey(path, params, options) : null;

  // Include CSRF token for unsafe requests
  const csrfToken = method !== "GET" ? getCsrfToken() : null;

  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  await ensureBackendAvailable();

  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const requestPromise = (async () => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Frappe-Site-Name": tenantConfig.erpSiteName
      };

      if (method !== "GET") {
        headers["X-Requested-With"] = "XMLHttpRequest";
      }

      if (requestBody) {
        headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
      }

      // Add CSRF token if available
      if (csrfToken) {
        headers["X-Frappe-CSRF-Token"] = csrfToken;
      }

      const response = await fetch(buildApiUrl(path, params), {
        method,
        credentials: "include",
        signal: controller.signal,
        headers,
        ...(requestBody ? { body: requestBody.toString() } : {})
      });

      const payload = (await response.json().catch(() => ({}))) as ErrorPayload;

      if (!response.ok) {
        markBackendFailureFromResponse(response.status);

        const fallbackMessage = `ERPNext istegi basarisiz oldu (${response.status})`;
        const serverMessage = parseServerMessage(payload);
        const errorMessage = serverMessage ?? payload.exc_type ?? fallbackMessage;
        throw new ErpRequestError(errorMessage, response.status);
      }

      markBackendAvailable();
      return payload as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        markBackendUnavailable();
        throw new ErpRequestError("ERPNext istegi zaman asimina ugradi.", 408);
      }

      if (markBackendFailureFromError(error)) {
        throw createBackendUnavailableError();
      }

      throw error;
    } finally {
      window.clearTimeout(timeoutHandle);
    }
  })();

  if (cacheKey) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  try {
    const payload = await requestPromise;

    if (cacheKey) {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + RESPONSE_CACHE_TTL_MS,
        value: payload
      });
    }

    return payload;
  } finally {
    if (cacheKey) {
      inFlightRequests.delete(cacheKey);
    }
  }
}

export function buildCachedRequestKey(path: string, params?: URLSearchParams, options: RequestOptions = {}) {
  return buildCacheKey(path, params, options);
}

export type ErpDocResponse = {
  data?: Record<string, unknown>;
  message?: Record<string, unknown>;
};

export async function postErpDoc<T extends ErpDocResponse>(
  doctype: string,
  docname: string | null,
  data: Record<string, unknown>,
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const path = docname ? `/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(docname)}` : `/resource/${encodeURIComponent(doctype)}`;
  const method = docname ? "PUT" : "POST";

  return requestErpJson<T>(path, undefined, {
    method,
    body: data,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    cacheKeySuffix: null // Never cache POST/PUT
  });
}
