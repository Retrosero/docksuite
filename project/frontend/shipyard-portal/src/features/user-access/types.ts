export type UserAccessUser = {
  id: string;
  fullName: string;
  enabled: boolean;
  userType: string;
  roles: string[];
};

export type UserAccessContext = {
  current_user: string;
  is_system_manager: boolean;
  available_roles: string[];
  users: UserAccessUser[];
};

export type CreateAdminUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
