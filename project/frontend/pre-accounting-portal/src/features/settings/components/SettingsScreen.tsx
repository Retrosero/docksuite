import type { FeatureSettings } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type SettingsScreenProps = {
  settings: FeatureSettings
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}

type SettingItem = {
  key: keyof FeatureSettings
  label: string
  description: string
}

const SETTING_ITEMS: SettingItem[] = [
  {
    key: 'dashboard.show_overdue_receivables',
    label: 'Vadesi geçen alacak kartını göster',
    description: 'Genel bakış ekranında gecikmiş alacak kartının görünürlüğünü yönetir.',
  },
  {
    key: 'sales_invoice.show_discount_button',
    label: 'İskonto butonunu göster',
    description: 'Satış faturası ekranında iskonto aksiyonunu aktif eder.',
  },
  {
    key: 'purchase_invoice.show_supplier_filter',
    label: 'Alışta tedarikçi filtresini göster',
    description: 'Alış faturası ekranındaki tedarikçi arama alanını yönetir.',
  },
  {
    key: 'customer.show_balance_panel',
    label: 'Cari bakiye alanlarını göster',
    description: 'Cari ve müşteri ekranlarında bakiye bilgisinin görünürlüğünü yönetir.',
  },
  {
    key: 'product.show_stock_badges',
    label: 'Ürün stok rozetlerini göster',
    description: 'Ürün listesinde düşük/yeterli stok rozetlerini yönetir.',
  },
  {
    key: 'stock.show_low_stock_alert',
    label: 'Kritik stok uyarısını göster',
    description: 'Stok ekranında kritik seviye uyarı kutusunu açar.',
  },
  {
    key: 'end_of_day.show_cash_difference',
    label: 'Gün sonu açık bakiye özetini göster',
    description: 'Gün sonu ekranında açık alacak ve açık ödeme özetini gösterir.',
  },
  {
    key: 'mobile.enable_quick_collection',
    label: 'Mobil hızlı tahsilatı aç',
    description: 'Mobil akışlarda hızlı tahsilat kısayolunu aktif eder.',
  },
]

export function SettingsScreen({ settings, onToggle }: SettingsScreenProps) {
  return (
    <PageSection title="Ayarlar" subtitle="Gösterim ve özellik yönetimi">
      <div className="setting-list">
        {SETTING_ITEMS.map((item) => (
          <label key={item.key} className="setting-item">
            <div>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
            </div>
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={(event) => onToggle(item.key, event.target.checked)}
            />
          </label>
        ))}
      </div>
    </PageSection>
  )
}
