import { erpGet, erpPost } from '../../../services/erpApi'
import type { CompanyUser, UserCreateForm, UserRoleTemplate } from '../types'

type CatalogResponse = {
  message?: {
    templates?: UserRoleTemplate[]
  }
}

type UserListResponse = {
  message?: {
    users?: CompanyUser[]
  }
}

type UserMutationResponse = {
  message?: {
    user?: CompanyUser
  }
}

const CATALOG_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.get_user_management_catalog'
const LIST_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.list_company_users'
const CREATE_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.create_company_user'
const ROLE_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.update_company_user_role_template'
const STATUS_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.set_company_user_enabled'

export async function fetchUserRoleTemplates(): Promise<UserRoleTemplate[]> {
  const response = await erpGet<CatalogResponse>(CATALOG_ENDPOINT)
  return response.message?.templates ?? []
}

export async function fetchCompanyUsers(): Promise<CompanyUser[]> {
  const response = await erpGet<UserListResponse>(LIST_ENDPOINT)
  return response.message?.users ?? []
}

export async function createCompanyUser(form: UserCreateForm): Promise<CompanyUser | null> {
  const response = await erpPost<UserMutationResponse, Record<string, string>>(CREATE_ENDPOINT, {
    email: form.email,
    first_name: form.firstName,
    last_name: form.lastName,
    role_template: form.roleTemplate,
  })
  return response.message?.user ?? null
}

export async function setCompanyUserRoleTemplate(email: string, roleTemplate: string): Promise<CompanyUser | null> {
  const response = await erpPost<UserMutationResponse, Record<string, string>>(ROLE_ENDPOINT, {
    email,
    role_template: roleTemplate,
  })
  return response.message?.user ?? null
}

export async function setCompanyUserEnabled(email: string, enabled: boolean): Promise<CompanyUser | null> {
  const response = await erpPost<UserMutationResponse, Record<string, string | number>>(STATUS_ENDPOINT, {
    email,
    enabled: enabled ? 1 : 0,
  })
  return response.message?.user ?? null
}
