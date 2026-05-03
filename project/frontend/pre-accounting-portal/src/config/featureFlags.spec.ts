import { describe, expect, it } from 'vitest'
import { DEFAULT_FEATURE_SETTINGS } from './featureFlags'

const REQUIRED_SETTING_KEYS = [
  'dashboard.show_overdue_receivables',
  'sales_invoice.show_discount_button',
  'purchase_invoice.show_supplier_filter',
  'customer.show_balance_panel',
  'product.show_stock_badges',
  'stock.show_low_stock_alert',
  'end_of_day.show_cash_difference',
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
})
