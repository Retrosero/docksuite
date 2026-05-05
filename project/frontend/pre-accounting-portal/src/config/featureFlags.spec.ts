import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FEATURE_SETTINGS,
  FEATURE_SETTING_DEFINITIONS,
  isFeatureSettingEnabledForPlan,
} from './featureFlags'

const REQUIRED_SETTING_KEYS = [
  'dashboard.show_overdue_receivables',
  'sales_invoice.show_quotation_flow',
  'sales_invoice.show_e_document_readiness',
  'sales_invoice.show_discount_button',
  'purchase_invoice.show_supplier_filter',
  'customer.show_balance_panel',
  'product.show_stock_badges',
  'stock.show_low_stock_alert',
  'end_of_day.show_cash_difference',
  'cash_bank.show_internal_transfer_panel',
  'cash_bank.show_recent_transfer_list',
  'mobile.enable_quick_collection',
]

describe('pre-accounting feature settings', () => {
  it('keeps the required tenant-controlled setting keys', () => {
    expect(Object.keys(DEFAULT_FEATURE_SETTINGS)).toEqual(REQUIRED_SETTING_KEYS)
  })

  it('uses boolean defaults for every feature flag', () => {
    for (const value of Object.values(DEFAULT_FEATURE_SETTINGS)) {
      expect(typeof value).toBe('boolean')
    }
  })

  it('keeps setting metadata aligned with setting defaults', () => {
    expect(FEATURE_SETTING_DEFINITIONS.map((item) => item.key)).toEqual(REQUIRED_SETTING_KEYS)
  })

  it('defines tenant scope, roles and mobile impact for every setting', () => {
    for (const item of FEATURE_SETTING_DEFINITIONS) {
      expect(item.scope).toBe('tenant')
      expect(item.enabledPlans.length).toBeGreaterThan(0)
      expect(item.managerRoles.length).toBeGreaterThan(0)
      expect(item.mobileImpact.length).toBeGreaterThan(0)
    }
  })

  it('keeps mobile-only quick collection outside the basic commercial plan', () => {
    const quickCollection = FEATURE_SETTING_DEFINITIONS.find((item) => item.key === 'mobile.enable_quick_collection')
    expect(quickCollection).toBeDefined()
    expect(isFeatureSettingEnabledForPlan(quickCollection!, 'ticari')).toBe(false)
    expect(isFeatureSettingEnabledForPlan(quickCollection!, 'mobil')).toBe(true)
  })
})
