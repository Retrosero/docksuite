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

export type FeatureSettingGroup =
  | 'Dashboard'
  | 'Cari'
  | 'Satış ve Fatura'
  | 'Alış'
  | 'Stok'
  | 'Gün Sonu'
  | 'Mobil'

export type FeatureSettingDefinition = {
  key: keyof FeatureSettings
  group: FeatureSettingGroup
  label: string
  description: string
  scope: 'tenant'
  planScope: 'Tüm planlar' | 'Ticari plan' | 'Mobil plan'
  managerRoles: string[]
  mobileImpact: string
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

export const FEATURE_SETTING_DEFINITIONS: FeatureSettingDefinition[] = [
  {
    key: 'dashboard.show_overdue_receivables',
    group: 'Dashboard',
    label: 'Vadesi geçen alacak kartını göster',
    description: 'Genel bakış ekranında gecikmiş alacak kartının görünürlüğünü yönetir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil genel bakışta aynı kart gizlenir.',
  },
  {
    key: 'sales_invoice.show_discount_button',
    group: 'Satış ve Fatura',
    label: 'İskonto butonunu göster',
    description: 'Satış faturası ekranında iskonto aksiyonunu aktif eder.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil satış akışında iskonto adımı açılır.',
  },
  {
    key: 'purchase_invoice.show_supplier_filter',
    group: 'Alış',
    label: 'Alışta tedarikçi filtresini göster',
    description: 'Alış faturası ekranındaki tedarikçi arama alanını yönetir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    managerRoles: ['Sistem Yöneticisi', 'Satın Alma Sorumlusu'],
    mobileImpact: 'Dar ekranda tedarikçi filtresi ikinci satırda gösterilir.',
  },
  {
    key: 'customer.show_balance_panel',
    group: 'Cari',
    label: 'Cari bakiye alanlarını göster',
    description: 'Cari ve müşteri ekranlarında bakiye bilgisinin görünürlüğünü yönetir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil cari kartlarında bakiye satırı gizlenir.',
  },
  {
    key: 'product.show_stock_badges',
    group: 'Stok',
    label: 'Ürün stok rozetlerini göster',
    description: 'Ürün listesinde düşük/yeterli stok rozetlerini yönetir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    managerRoles: ['Sistem Yöneticisi', 'Depo Sorumlusu'],
    mobileImpact: 'Mobil ürün listesinde rozet alanı kapanır.',
  },
  {
    key: 'stock.show_low_stock_alert',
    group: 'Stok',
    label: 'Kritik stok uyarısını göster',
    description: 'Stok ekranında kritik seviye uyarı kutusunu açar.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    managerRoles: ['Sistem Yöneticisi', 'Depo Sorumlusu'],
    mobileImpact: 'Mobil stok ekranında üst uyarı bandı gizlenir.',
  },
  {
    key: 'end_of_day.show_cash_difference',
    group: 'Gün Sonu',
    label: 'Gün sonu açık bakiye özetini göster',
    description: 'Gün sonu ekranında açık alacak ve açık ödeme özetini gösterir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil gün sonu özetinde fark satırı gizlenir.',
  },
  {
    key: 'mobile.enable_quick_collection',
    group: 'Mobil',
    label: 'Mobil hızlı tahsilatı aç',
    description: 'Mobil akışlarda hızlı tahsilat kısayolunu aktif eder.',
    scope: 'tenant',
    planScope: 'Mobil plan',
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil ana işlem akışında tahsilat kısayolu açılır.',
  },
]
