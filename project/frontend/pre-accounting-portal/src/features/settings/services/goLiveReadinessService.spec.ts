import { describe, expect, it } from 'vitest'
import { DEFAULT_FEATURE_SETTINGS } from '../../../config/featureFlags'
import { DEFAULT_TENANT_CONFIG } from '../../../config/tenant'
import { buildGoLiveReadinessSummary } from './goLiveReadinessService'

describe('buildGoLiveReadinessSummary', () => {
  it('varsayilan ticari kurulumda canli kullanim kontrollerini hazir sayar', () => {
    const summary = buildGoLiveReadinessSummary(DEFAULT_FEATURE_SETTINGS, DEFAULT_TENANT_CONFIG)

    expect(summary.readyCount).toBe(summary.totalCount)
    expect(summary.items.every((item) => item.isReady)).toBe(true)
  })

  it('kritik satis ayari kapaliysa satis kontrolunu hazir saymaz', () => {
    const summary = buildGoLiveReadinessSummary(
      { ...DEFAULT_FEATURE_SETTINGS, 'sales_invoice.show_return_readiness': false },
      DEFAULT_TENANT_CONFIG,
    )

    expect(summary.readyCount).toBe(summary.totalCount - 1)
    expect(summary.items.find((item) => item.key === 'sales')?.isReady).toBe(false)
  })
})
