import { FEATURE_SETTING_DEFINITIONS, type FeatureSettings, type FeatureSettingGroup } from '../../../config/featureFlags'
import { PageSection } from '../../../shared/ui/PageSection'

type SettingsScreenProps = {
  settings: FeatureSettings
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}

const GROUP_ORDER: FeatureSettingGroup[] = ['Dashboard', 'Cari', 'Satış ve Fatura', 'Alış', 'Stok', 'Gün Sonu', 'Mobil']

export function SettingsScreen({ settings, onToggle }: SettingsScreenProps) {
  return (
    <PageSection title="Ayarlar" subtitle="Tenant özellikleri, plan kapsamı ve mobil davranış">
      <div className="settings-overview">
        <div>
          <strong>{FEATURE_SETTING_DEFINITIONS.length}</strong>
          <span>Yönetilen ayar</span>
        </div>
        <div>
          <strong>{FEATURE_SETTING_DEFINITIONS.filter((item) => settings[item.key]).length}</strong>
          <span>Aktif özellik</span>
        </div>
      </div>

      <div className="setting-group-list">
        {GROUP_ORDER.map((group) => {
          const groupItems = FEATURE_SETTING_DEFINITIONS.filter((item) => item.group === group)
          if (!groupItems.length) return null

          return (
            <section key={group} className="setting-group" aria-labelledby={`setting-group-${group}`}>
              <div className="setting-group-head">
                <h3 id={`setting-group-${group}`}>{group}</h3>
                <span>{groupItems.length} ayar</span>
              </div>

              <div className="setting-list">
                {groupItems.map((item) => (
                  <label key={item.key} className="setting-item">
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.description}</p>
                      <div className="setting-meta">
                        <span>Tenant</span>
                        <span>{item.planScope}</span>
                        <span>{item.managerRoles.join(', ')}</span>
                      </div>
                      <small>{item.mobileImpact}</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(event) => onToggle(item.key, event.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </PageSection>
  )
}
