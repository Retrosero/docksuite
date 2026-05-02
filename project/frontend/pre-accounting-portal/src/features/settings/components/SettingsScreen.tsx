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
    label: 'Vadesi gecen alacak kartini goster',
    description: 'Dashboard ekraninda gecikmis alacak kartinin gorunurlugunu yonetir.',
  },
  {
    key: 'sales_invoice.show_discount_button',
    label: 'Iskonto butonunu goster',
    description: 'Satis faturasi ekraninda iskonto aksiyonunu aktif eder.',
  },
  {
    key: 'customer.show_balance_panel',
    label: 'Cari bakiye kolonunu goster',
    description: 'Cari listesinde bakiye kolonunun gorunurlugunu yonetir.',
  },
  {
    key: 'stock.show_low_stock_alert',
    label: 'Kritik stok uyarisini goster',
    description: 'Stok ekraninda kritik seviye uyari kutusunu acar.',
  },
  {
    key: 'mobile.enable_quick_collection',
    label: 'Mobil hizli tahsilati ac',
    description: 'Mobil akislarda hizli tahsilat kisayolunu aktif eder.',
  },
]

export function SettingsScreen({ settings, onToggle }: SettingsScreenProps) {
  return (
    <PageSection title="Ayarlar" subtitle="Gosterim ve ozellik yonetimi">
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
