export type UserRoleTemplate = {
  key: string
  label: string
  roles: string[]
}

export type CompanyUser = {
  email: string
  full_name: string
  enabled: boolean
  role_template: string | null
  managed_roles: string[]
}

export type UserCreateForm = {
  email: string
  firstName: string
  lastName: string
  roleTemplate: string
}
