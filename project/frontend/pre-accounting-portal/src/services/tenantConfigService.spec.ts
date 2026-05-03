import { describe, expect, it } from 'vitest'
import { DEFAULT_TENANT_CONFIG } from '../config/tenant'
import { mergeTenantConfig } from './tenantConfigService'

describe('tenant config service helpers', () => {
  it('fills missing backend config fields with product defaults', () => {
    expect(
      mergeTenantConfig({
        siteName: 'demo.localhost',
        plan: 'mobil',
      }),
    ).toEqual({
      ...DEFAULT_TENANT_CONFIG,
      siteName: 'demo.localhost',
      plan: 'mobil',
    })
  })

  it('uses default tenant config when backend payload is empty', () => {
    expect(mergeTenantConfig()).toEqual(DEFAULT_TENANT_CONFIG)
  })
})
