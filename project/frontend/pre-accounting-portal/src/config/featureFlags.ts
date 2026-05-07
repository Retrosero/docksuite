import type { TenantPlan } from './tenant'

export type FeatureSettings = {
  'dashboard.show_overdue_receivables': boolean
  'sales_invoice.show_quotation_flow': boolean
  'sales_invoice.show_quotation_conversion_readiness': boolean
  'sales_invoice.show_e_document_readiness': boolean
  'sales_invoice.show_return_readiness': boolean
  'sales_invoice.show_discount_button': boolean
  'purchase_invoice.show_supplier_filter': boolean
  'customer.allow_quick_create': boolean
  'customer.show_balance_panel': boolean
  'supplier.allow_quick_create': boolean
  'product.allow_quick_create': boolean
  'product.show_stock_badges': boolean
  'security.enable_user_management_panel': boolean
  'stock.show_low_stock_alert': boolean
  'end_of_day.show_cash_difference': boolean
  'cash_bank.show_internal_transfer_panel': boolean
  'cash_bank.show_recent_transfer_list': boolean
  'cash_bank.show_bank_reconciliation_panel': boolean
  'reports.enable_csv_export': boolean
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
  | 'Raporlar'
  | 'Mobil'
  | 'Güvenlik ve Yetki'

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
  'sales_invoice.show_quotation_conversion_readiness': true,
  'sales_invoice.show_e_document_readiness': true,
  'sales_invoice.show_return_readiness': true,
  'sales_invoice.show_discount_button': false,
  'purchase_invoice.show_supplier_filter': true,
  'customer.allow_quick_create': true,
  'customer.show_balance_panel': true,
  'supplier.allow_quick_create': true,
  'product.allow_quick_create': true,
  'product.show_stock_badges': true,
  'security.enable_user_management_panel': true,
  'stock.show_low_stock_alert': true,
  'end_of_day.show_cash_difference': true,
  'cash_bank.show_internal_transfer_panel': true,
  'cash_bank.show_recent_transfer_list': true,
  'cash_bank.show_bank_reconciliation_panel': true,
  'reports.enable_csv_export': true,
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
    key: 'sales_invoice.show_quotation_conversion_readiness',
    group: 'Satış ve Fatura',
    label: 'Teklif dönüşüm hazırlığını göster',
    description: 'Satış ekranında faturaya veya siparişe dönüşebilecek onaylı tekliflerin özetini gösterir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Satış Sorumlusu', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil satış ekranında dönüşüm adayı teklif kartları görünür.',
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
    key: 'customer.allow_quick_create',
    group: 'Cari',
    label: 'Müşteri hızlı oluşturmayı aç',
    description: 'Müşteriler ekranında kısa müşteri kartı oluşturma formunu gösterir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    enabledPlans: ['temel', 'ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu', 'Satış Sorumlusu'],
    mobileImpact: 'Mobil müşteri ekranında yeni müşteri kartı formu açılır.',
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
    key: 'supplier.allow_quick_create',
    group: 'Cari',
    label: 'Tedarikçi hızlı oluşturmayı aç',
    description: 'Cari ekranında kısa tedarikçi kartı oluşturma formunu gösterir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    enabledPlans: ['temel', 'ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu', 'Satın Alma Sorumlusu'],
    mobileImpact: 'Mobil cari ekranında yeni tedarikçi kartı formu açılır.',
  },
  {
    key: 'product.allow_quick_create',
    group: 'Stok',
    label: 'Ürün hızlı oluşturmayı aç',
    description: 'Ürünler ekranında kısa ürün kartı oluşturma formunu gösterir.',
    scope: 'tenant',
    planScope: 'Tüm planlar',
    enabledPlans: ['temel', 'ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Depo Sorumlusu', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil ürün ekranında yeni ürün kartı formu açılır.',
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
    key: 'security.enable_user_management_panel',
    group: 'Güvenlik ve Yetki',
    label: 'Kullanıcı yönetimi panelini aç',
    description: 'Kullanıcılar ekranında personel ekleme, rol atama ve aktif/pasif yönetimi işlemlerini açar.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil kullanımda kullanıcılar ekranı ve yetki kartları görünür.',
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
    key: 'cash_bank.show_bank_reconciliation_panel',
    group: 'Kasa/Banka',
    label: 'Banka mutabakat panelini goster',
    description: 'Kasa/Banka ekraninda ekstre yukleme ve otomatik eslestirme onerisi panelini yonetir.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobilde mutabakat panelinin gorunurlugunu kontrol eder.',
  },  {
    key: 'reports.enable_csv_export',
    group: 'Raporlar',
    label: 'CSV rapor indirmeyi aç',
    description: 'Raporlar ekranındaki özet metriklerin CSV olarak indirilmesini sağlar.',
    scope: 'tenant',
    planScope: 'Ticari plan',
    enabledPlans: ['ticari', 'mobil'],
    managerRoles: ['Sistem Yöneticisi', 'Muhasebe Sorumlusu'],
    mobileImpact: 'Mobil rapor ekranında CSV indirme aksiyonu görünür.',
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

