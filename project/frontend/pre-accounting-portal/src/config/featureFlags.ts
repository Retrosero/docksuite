export type FeatureSettings = {
  'dashboard.show_overdue_receivables': boolean
  'sales_invoice.show_discount_button': boolean
  'purchase_invoice.show_supplier_filter': boolean
  'customer.show_balance_panel': boolean
  'product.show_stock_badges': boolean
  'stock.show_low_stock_alert': boolean
  'end_of_day.show_cash_difference': boolean
  'mobile.enable_quick_collection': boolean
}

export const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  'dashboard.show_overdue_receivables': true,
  'sales_invoice.show_discount_button': false,
  'purchase_invoice.show_supplier_filter': true,
  'customer.show_balance_panel': true,
  'product.show_stock_badges': true,
  'stock.show_low_stock_alert': true,
  'end_of_day.show_cash_difference': true,
  'mobile.enable_quick_collection': false,
}
