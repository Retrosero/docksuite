import { erpGet, erpPost } from './erpApi'
import type { RoleTemplateKey } from '../app/routes'
import type { ActionKey } from '../shared/hooks/usePermission'

export type ActionAccessMap = Record<ActionKey, boolean>
export type ActionAccessMatrix = Record<RoleTemplateKey, ActionAccessMap>
export type ActionLimitMatrix = Partial<Record<ActionKey, number | null>>

type ActionMatrixResponse = {
  message?: {
    matrix?: ActionAccessMatrix
  }
}

type ActionLimitResponse = {
  message?: {
    limits?: ActionLimitMatrix
  }
}

const ACTIONS: ActionKey[] = [
  'create_sales_invoice',
  'submit_sales_invoice',
  'cancel_sales_invoice',
  'create_purchase_invoice',
  'submit_purchase_invoice',
  'create_payment_entry',
  'submit_payment_entry',
  'create_transfer',
  'submit_transfer',
  'create_expense',
  'submit_expense',
  'manage_users',
  'update_settings',
]
const ROLE_KEYS: RoleTemplateKey[] = ['yonetici', 'muhasebe_sorumlusu', 'satis_operasyon', 'depo_sorumlusu', 'salt_okuma']
const GET_ACTION_MATRIX_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.get_action_access_matrix'
const SAVE_ACTION_RULE_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.save_action_access_rule'
const GET_ACTION_LIMIT_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.get_action_limit_matrix'
const SAVE_ACTION_LIMIT_ENDPOINT = '/method/shipyard_app.pre_accounting_user_api.save_action_limit_rule'

export function getDefaultActionAccessMatrix(): ActionAccessMatrix {
  const matrix = {} as ActionAccessMatrix
  for (const role of ROLE_KEYS) {
    matrix[role] = {} as ActionAccessMap
    for (const action of ACTIONS) {
      matrix[role][action] = true
    }
  }
  return matrix
}

export async function getActionAccessMatrix(): Promise<ActionAccessMatrix> {
  try {
    const response = await erpGet<ActionMatrixResponse>(GET_ACTION_MATRIX_ENDPOINT)
    return response.message?.matrix ?? getDefaultActionAccessMatrix()
  } catch {
    return getDefaultActionAccessMatrix()
  }
}

export async function saveActionAccessRule(
  roleTemplate: RoleTemplateKey,
  actionKey: ActionKey,
  isEnabled: boolean,
): Promise<ActionAccessMatrix> {
  const response = await erpPost<ActionMatrixResponse, { role_template: string; action_key: string; is_enabled: number }>(
    SAVE_ACTION_RULE_ENDPOINT,
    {
      role_template: roleTemplate,
      action_key: actionKey,
      is_enabled: isEnabled ? 1 : 0,
    },
  )
  return response.message?.matrix ?? getDefaultActionAccessMatrix()
}

export async function getActionLimitMatrix(): Promise<ActionLimitMatrix> {
  try {
    const response = await erpGet<ActionLimitResponse>(GET_ACTION_LIMIT_ENDPOINT)
    return response.message?.limits ?? {}
  } catch {
    return {}
  }
}

export async function saveActionLimitRule(actionKey: ActionKey, limitValue: number | null): Promise<ActionLimitMatrix> {
  const response = await erpPost<ActionLimitResponse, { action_key: string; limit_value: number | null }>(
    SAVE_ACTION_LIMIT_ENDPOINT,
    {
      action_key: actionKey,
      limit_value: limitValue,
    },
  )
  return response.message?.limits ?? {}
}
