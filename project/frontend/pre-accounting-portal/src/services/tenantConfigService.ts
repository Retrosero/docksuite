import { DEFAULT_TENANT_CONFIG, type TenantConfig } from '../config/tenant'
import { erpGet } from './erpApi'

const GET_TENANT_CONFIG_ENDPOINT = '/method/shipyard_app.pre_accounting_api.get_tenant_config'

type TenantConfigResponse = {
  message?: {
    config?: Partial<TenantConfig>
  }
}

export function mergeTenantConfig(config?: Partial<TenantConfig>): TenantConfig {
  return { ...DEFAULT_TENANT_CONFIG, ...config }
}

export async function getTenantConfig(): Promise<TenantConfig> {
  try {
    const response = await erpGet<TenantConfigResponse>(GET_TENANT_CONFIG_ENDPOINT)
    return mergeTenantConfig(response.message?.config)
  } catch {
    return DEFAULT_TENANT_CONFIG
  }
}
