import { tenantConfig } from "../config/tenant";

type RequestOptions = {
  method?: "GET" | "POST";
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

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function buildApiUrl(path: string, params?: URLSearchParams) {
  const baseUrl = trimTrailingSlash(tenantConfig.erpApiBaseUrl);
  const query = params?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

function buildCacheKey(path: string, params: URLSearchParams | undefined, options: RequestOptions) {
  const method = options.method ?? "GET";
  const bodyKey = options.body ? JSON.stringify(options.body) : "";
  const cacheKeySuffix = options.cacheKeySuffix !== null && options.cacheKeySuffix !== undefined ? String(options.cacheKeySuffix) : "";
  return `${method}:${buildApiUrl(path, params)}:${bodyKey}:${cacheKeySuffix}`;
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
  const requestBody = method === "POST" && options.body ? toFormBody(options.body) : null;
  const cacheKey = method === "GET" ? buildCacheKey(path, params, options) : null;

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

  const controller = new AbortController();
  const timeoutHandle = window.setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const requestPromise = (async () => {
    try {
      const response = await fetch(buildApiUrl(path, params), {
        method,
        credentials: "include",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-Frappe-Site-Name": tenantConfig.erpSiteName,
          ...(method !== "GET" ? { "X-Requested-With": "XMLHttpRequest" } : {}),
          ...(requestBody ? { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" } : {})
        },
        ...(requestBody ? { body: requestBody.toString() } : {})
      });

      const payload = (await response.json().catch(() => ({}))) as ErrorPayload;

      if (!response.ok) {
        const fallbackMessage = `ERPNext istegi basarisiz oldu (${response.status})`;
        const serverMessage = parseServerMessage(payload);
        const errorMessage = serverMessage ?? payload.exc_type ?? fallbackMessage;
        throw new ErpRequestError(errorMessage, response.status);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ErpRequestError("ERPNext istegi zaman asimina ugradi.", 408);
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
