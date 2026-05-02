export type FeatureSettings = {
  'dashboard.show_overdue_receivables': boolean
  'sales_invoice.show_discount_button': boolean
  'customer.show_balance_panel': boolean
  'stock.show_low_stock_alert': boolean
  'mobile.enable_quick_collection': boolean
}

export const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  'dashboard.show_overdue_receivables': true,
  'sales_invoice.show_discount_button': false,
  'customer.show_balance_panel': true,
  'stock.show_low_stock_alert': true,
  'mobile.enable_quick_collection': false,
}
