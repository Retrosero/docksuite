import { requestErpJson } from "../../../lib/erpApi";

type LoggedUserResponse = {
  message?: string;
};

type LoginResponse = {
  message?: string;
  full_name?: string;
  home_page?: string;
};

export type AuthSession = {
  isAuthenticated: boolean;
  userId: string | null;
};

function normalizeUserId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized === "Guest") {
    return null;
  }

  return normalized;
}

export async function getAuthSession(): Promise<AuthSession> {
  const payload = await requestErpJson<LoggedUserResponse>("/method/frappe.auth.get_logged_user");
  const userId = normalizeUserId(payload.message);

  return {
    isAuthenticated: Boolean(userId),
    userId
  };
}

export async function loginWithPassword(username: string, password: string): Promise<AuthSession> {
  await requestErpJson<LoginResponse>("/method/login", undefined, {
    method: "POST",
    body: {
      usr: username,
      pwd: password
    },
    cacheKeySuffix: null
  });

  return getAuthSession();
}

export async function logoutSession() {
  await requestErpJson("/method/logout", undefined, {
    method: "POST",
    cacheKeySuffix: null
  });
}
