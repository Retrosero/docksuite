import {
  FEATURE_SETTING_DEFINITIONS,
  isFeatureSettingEnabledForPlan,
  type FeatureSettings,
  type FeatureSettingGroup,
} from '../../../config/featureFlags'
import { TENANT_PLAN_LABELS, type TenantConfig } from '../../../config/tenant'
import { PageSection } from '../../../shared/ui/PageSection'

type SettingsScreenProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}

const GROUP_ORDER: FeatureSettingGroup[] = ['Dashboard', 'Cari', 'Satış ve Fatura', 'Alış', 'Stok', 'Gün Sonu', 'Mobil']

export function SettingsScreen({ settings, tenantConfig, onToggle }: SettingsScreenProps) {
  const activeDefinitions = FEATURE_SETTING_DEFINITIONS.filter((item) =>
    isFeatureSettingEnabledForPlan(item, tenantConfig.plan),
  )

  return (
    <PageSection title="Ayarlar" subtitle="Tenant özellikleri, plan kapsamı ve mobil davranış">
      <div className="settings-overview">
        <div>
          <strong>{FEATURE_SETTING_DEFINITIONS.length}</strong>
          <span>Yönetilen ayar</span>
        </div>
        <div>
          <strong>{activeDefinitions.filter((item) => settings[item.key]).length}</strong>
          <span>Aktif özellik</span>
        </div>
        <div>
          <strong>{TENANT_PLAN_LABELS[tenantConfig.plan]}</strong>
          <span>Geçerli tenant planı</span>
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
                {groupItems.map((item) => {
                  const isPlanEnabled = isFeatureSettingEnabledForPlan(item, tenantConfig.plan)

                  return (
                    <label key={item.key} className={isPlanEnabled ? 'setting-item' : 'setting-item disabled'}>
                      <div>
                        <strong>{item.label}</strong>
                        <p>{item.description}</p>
                        <div className="setting-meta">
                          <span>Tenant</span>
                          <span>{item.planScope}</span>
                          <span>{item.managerRoles.join(', ')}</span>
                        </div>
                        <small>
                          {isPlanEnabled
                            ? item.mobileImpact
                            : `${TENANT_PLAN_LABELS[tenantConfig.plan]} bu ayarı kapsamaz.`}
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[item.key] && isPlanEnabled}
                        disabled={!isPlanEnabled}
                        onChange={(event) => onToggle(item.key, event.target.checked)}
                      />
                    </label>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </PageSection>
  )
}
