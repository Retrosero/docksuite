import type { FeatureSettings } from '../../../config/featureFlags'
import type { TenantConfig } from '../../../config/tenant'

export type GoLiveReadinessItem = {
  key: string
  label: string
  isReady: boolean
}

export type GoLiveReadinessSummary = {
  readyCount: number
  totalCount: number
  items: GoLiveReadinessItem[]
}

export function buildGoLiveReadinessSummary(settings: FeatureSettings, tenantConfig: TenantConfig): GoLiveReadinessSummary {
  const items: GoLiveReadinessItem[] = [
    {
      key: 'sales',
      label: 'Satış teklif, iade ve e-belge hazırlık ayarları açık',
      isReady:
        settings['sales_invoice.show_quotation_flow'] &&
        settings['sales_invoice.show_quotation_conversion_readiness'] &&
        settings['sales_invoice.show_return_readiness'] &&
        settings['sales_invoice.show_e_document_readiness'],
    },
    {
      key: 'cash_bank',
      label: 'Kasa/Banka transfer görünürlüğü aktif',
      isReady: settings['cash_bank.show_internal_transfer_panel'] && settings['cash_bank.show_recent_transfer_list'],
    },
    {
      key: 'master_data',
      label: 'Müşteri, tedarikçi ve ürün hızlı kart oluşturma aktif',
      isReady:
        settings['customer.allow_quick_create'] &&
        settings['supplier.allow_quick_create'] &&
        settings['product.allow_quick_create'],
    },
    {
      key: 'reports',
      label: 'Rapor CSV export aktif',
      isReady: settings['reports.enable_csv_export'],
    },
    {
      key: 'access_control',
      label: 'Kullanıcı ve yetki yönetimi paneli aktif',
      isReady: settings['security.enable_user_management_panel'],
    },
    {
      key: 'mobile',
      label: 'Tenant planı mobil veya ticari kullanım için uygun',
      isReady: tenantConfig.plan === 'ticari' || tenantConfig.plan === 'mobil',
    },
  ]

  return {
    readyCount: items.filter((item) => item.isReady).length,
    totalCount: items.length,
    items,
  }
}
