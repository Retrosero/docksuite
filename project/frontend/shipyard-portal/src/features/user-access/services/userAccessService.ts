import { requestErpJson } from "../../../lib/erpApi";
import type { CreateAdminUserInput, UserAccessContext } from "../types";

type FrappeMethodResponse<T> = {
  message?: T;
};

export async function fetchUserAccessContext(): Promise<UserAccessContext> {
  const payload = await requestErpJson<FrappeMethodResponse<UserAccessContext>>(
    "/method/shipyard_app.user_access_api.get_user_access_context"
  );

  return payload.message ?? {
    current_user: "",
    is_system_manager: false,
    available_roles: [],
    users: [],
  };
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<void> {
  await requestErpJson<{ message?: unknown }>(
    "/method/shipyard_app.user_access_api.create_admin_user",
    undefined,
    {
      method: "POST",
      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
      },
      cacheKeySuffix: null,
    }
  );
}

export async function updateUserRoles(userId: string, roles: string[]): Promise<void> {
  await requestErpJson<{ message?: unknown }>(
    "/method/shipyard_app.user_access_api.update_user_roles",
    undefined,
    {
      method: "POST",
      body: {
        user_id: userId,
        roles: JSON.stringify(roles),
      },
      cacheKeySuffix: null,
    }
  );
}

export async function setUserEnabled(userId: string, enabled: boolean): Promise<void> {
  await requestErpJson<{ message?: unknown }>(
    "/method/shipyard_app.user_access_api.set_user_enabled",
    undefined,
    {
      method: "POST",
      body: {
        user_id: userId,
        enabled: enabled ? 1 : 0,
      },
      cacheKeySuffix: null,
    }
  );
}
