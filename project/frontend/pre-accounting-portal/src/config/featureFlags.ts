import type { TenantPlan } from './tenant'

export type FeatureSettings = {
  'dashboard.show_overdue_receivables': boolean
  'sales_invoice.show_quotation_flow': boolean
  'sales_invoice.show_e_document_readiness': boolean
  'sales_invoice.show_return_readiness': boolean
  'sales_invoice.show_discount_button': boolean
  'purchase_invoice.show_supplier_filter': boolean
  'customer.show_balance_panel': boolean
  'product.show_stock_badges': boolean
  'stock.show_low_stock_alert': boolean
  'end_of_day.show_cash_difference': boolean
  'cash_bank.show_internal_transfer_panel': boolean
  'cash_bank.show_recent_transfer_list': boolean
  'mobile.enable_quick_collection': boolean
}

export type FeatureSettingGroup =
  | 'Dashboard'
  | 'Cari'
  | 'Satış ve Fatura'
  | 'Alış'
  | 'Stok'
  | 'Kasa/Banka'
  | 'Gün Sonu'
  | 'Mobil'

export type FeatureSettingDefinition = {
  key: keyof FeatureSettings
  group: FeatureSettingGroup
  label: string
  description: string
  scope: 'tenant'
  planScope: 'Tüm planlar' | 'Ticari plan' | 'Mobil plan'
  enabledPlans: TenantPlan[]
  managerRoles: string[]
  mobileImpact: string
}

export const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  'dashboard.show_overdue_receivables': true,
  'sales_invoice.show_quotation_flow': true,
  'sales_invoice.show_e_document_readiness': true,
  'sales_invoice.show_return_readiness': true,
  'sales_invoice.show_discount_button': false,
  'purchase_invoice.show_supplier_filter': true,
  'customer.show_balance_panel': true,
  'product.show_stock_badges': true,
  'stock.show_low_stock_alert': true,
  'end_of_day.show_cash_difference': true,
  'cash_bank.show_internal_transfer_panel': true,
  'cash_bank.show_recent_transfer_list': true,
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
    enabledPlans: ['temel', 'ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil genel bakışta aynı kart gizlenir.',
  },
  {
    key: 'sales_invoice.show_quotation_flow',
    group: 'Satış ve Fatura',
    label: 'Teklif akışını göster',
    description: 'Satış ekranında ERPNext Quotation kaynağına bağlı teklif oluşturma ve son teklifler alanını gösterir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Satış Sorumlusu', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil satış ekranında teklif hızlı giriş akışı açılır.',
  },
  {
    key: 'sales_invoice.show_e_document_readiness',
    group: 'Satış ve Fatura',
    label: 'E-belge hazırlık panelini göster',
    description: 'Satış faturası ekranında e-fatura/e-arşiv entegrasyonuna hazır kesilmiş faturaların özetini gösterir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil satış ekranında e-belge gönderim hazırlığı kartı görünür.',
  },
  {
    key: 'sales_invoice.show_return_readiness',
    group: 'Satış ve Fatura',
    label: 'İptal ve iade hazırlık panelini göster',
    description: 'Satış faturası ekranında kesilmiş faturalar ve mevcut iade kayıtları için hazırlık özetini gösterir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil satış ekranında iade hazırlık kartları görünür.',
  },
  {
    key: 'sales_invoice.show_discount_button',
    group: 'Satış ve Fatura',
    label: 'İskonto butonunu göster',
    description: 'Satış faturası ekranında iskonto aksiyonunu aktif eder.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
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
    enabledPlans: ['temel', 'ticari', 'mobil'],
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
    enabledPlans: ['temel', 'ticari', 'mobil'],
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
    enabledPlans: ['temel', 'ticari', 'mobil'],
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
    enabledPlans: ['ticari', 'mobil'],
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
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil gün sonu özetinde fark satırı gizlenir.',
  },
  {
    key: 'cash_bank.show_internal_transfer_panel',
    group: 'Kasa/Banka',
    label: 'Transfer panelini göster',
    description: 'Kasa/Banka ekranında hesaplar arası transfer panelini yönetir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobilde transfer formu görünürlüğünü belirler.',
  },
  {
    key: 'cash_bank.show_recent_transfer_list',
    group: 'Kasa/Banka',
    label: 'Son transferleri göster',
    description: 'Kasa/Banka ekranında son transfer kart listesini yönetir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobilde son transfer kart alanını açar veya kapatır.',
  },
  {
    key: 'mobile.enable_quick_collection',
    group: 'Mobil',
    label: 'Mobil hızlı tahsilatı aç',
    description: 'Mobil akışlarda hızlı tahsilat kısayolunu aktif eder.',
    scope: 'tenant',
    planScope: 'Mobil plan',
    enabledPlans: ['mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil ana işlem akışında tahsilat kısayolu açılır.',
  },
]

export function isFeatureSettingEnabledForPlan(
  definition: FeatureSettingDefinition,
  plan: TenantPlan,
): boolean {
  return definition.enabledPlans.includes(plan)
}
