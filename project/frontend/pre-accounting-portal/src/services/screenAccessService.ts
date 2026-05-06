import { erpGet, erpPost } from './erpApi'
import { APP_ROUTES, type RoleTemplateKey, type ScreenAccessMatrix } from '../app/routes'

type MatrixResponse = {
  message?: {
    matrix?: ScreenAccessMatrix
  }
}

const GET_MATRIX_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.get_screen_access_matrix'
const SAVE_RULE_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.save_screen_access_rule'

export function getDefaultScreenAccessMatrix(): ScreenAccessMatrix {
  const roleKeys: RoleTemplateKey[] = ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'depo_sorumlusu', 'salt_okuma']
  const matrix = {} as ScreenAccessMatrix
  for (const role of roleKeys) {
    matrix[role] = {}
    for (const route of APP_ROUTES) {
      matrix[role][route.key] = route.allowedTemplates === 'all' || route.allowedTemplates.includes(role)
    }
  }
  return matrix
}

export async function getScreenAccessMatrix(): Promise<ScreenAccessMatrix> {
  try {
    const response = await erpGet<MatrixResponse>(GET_MATRIX_ENDPOINT)
    const matrix = response.message?.matrix
    if (!matrix) return getDefaultScreenAccessMatrix()
    return matrix
  } catch {
    return getDefaultScreenAccessMatrix()
  }
}

export async function saveScreenAccessRule(
  roleTemplate: RoleTemplateKey,
  routeKey: string,
  isEnabled: boolean,
): Promise<ScreenAccessMatrix> {
  const response = await erpPost<MatrixResponse, { role_template: string; route_key: string; is_enabled: number }>(
    SAVE_RULE_ENDPOINT,
    {
      role_template: roleTemplate,
      route_key: routeKey,
      is_enabled: isEnabled ? 1 : 0,
    },
  )
  return response.message?.matrix ?? getDefaultScreenAccessMatrix()
}
