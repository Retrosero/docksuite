import { useEffect, useState } from 'react'
import { DEFAULT_TENANT_CONFIG, type TenantConfig } from '../../config/tenant'
import { getTenantConfig } from '../../services/tenantConfigService'

export function useTenantConfig() {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(DEFAULT_TENANT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getTenantConfig()
      .then((loaded) => {
        if (active) setTenantConfig(loaded)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { tenantConfig, isLoading }
}
