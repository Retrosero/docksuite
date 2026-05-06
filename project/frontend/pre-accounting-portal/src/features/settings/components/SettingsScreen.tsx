import { useEffect, useMemo, useState } from 'react'
import {
  FEATURE_SETTING_DEFINITIONS,
  isFeatureSettingEnabledForPlan,
  type FeatureSettings,
  type FeatureSettingGroup,
} from '../../../config/featureFlags'
import { TENANT_PLAN_LABELS, type TenantConfig } from '../../../config/tenant'
import { APP_ROUTES, type RoleTemplateKey, type ScreenAccessMatrix } from '../../../app/routes'
import { PageSection } from '../../../shared/ui/PageSection'
import { buildGoLiveReadinessSummary } from '../services/goLiveReadinessService'
import {
  REQUIRED_MASTER_DATA_DEFINITIONS,
  createRequiredMasterDataEntry,
  fetchParentOptions,
  fetchRequiredMasterDataStatuses,
  type ParentOption,
  type RequiredMasterDataKey,
  type RequiredMasterDataStatus,
} from '../services/masterDataSettingsService'

type SettingsScreenProps = {
  settings: FeatureSettings
  tenantConfig: TenantConfig
  screenAccessMatrix: ScreenAccessMatrix
  onScreenAccessToggle: (roleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => Promise<void>
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}

const GROUP_ORDER: FeatureSettingGroup[] = [
  'Dashboard',
  'Cari',
  'Satış ve Fatura',
  'Alış',
  'Stok',
  'Kasa/Banka',
  'Gün Sonu',
  'Raporlar',
  'Mobil',
  'Güvenlik ve Yetki',
]

export function SettingsScreen({ settings, tenantConfig, screenAccessMatrix, onScreenAccessToggle, onToggle }: SettingsScreenProps) {
  const [statuses, setStatuses] = useState<RequiredMasterDataStatus[]>([])
  const [isStatusLoading, setIsStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([])
  const [isParentLoading, setIsParentLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSavingScreenAccess, setIsSavingScreenAccess] = useState(false)
  const [masterDataMessage, setMasterDataMessage] = useState<string | null>(null)
  const [screenAccessMessage, setScreenAccessMessage] = useState<string | null>(null)
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState<RoleTemplateKey>('yonetici')
  const [masterDataForm, setMasterDataForm] = useState<{
    key: RequiredMasterDataKey
    label: string
    parentName: string
  }>({
    key: 'customer_group',
    label: '',
    parentName: '',
  })

  const activeDefinitions = FEATURE_SETTING_DEFINITIONS.filter((item) =>
    isFeatureSettingEnabledForPlan(item, tenantConfig.plan),
  )
  const readiness = buildGoLiveReadinessSummary(settings, tenantConfig)
  const selectedMasterDefinition = useMemo(
    () => REQUIRED_MASTER_DATA_DEFINITIONS.find((item) => item.key === masterDataForm.key) ?? REQUIRED_MASTER_DATA_DEFINITIONS[0],
    [masterDataForm.key],
  )
  const needsParent = Boolean(selectedMasterDefinition.parentField)
  const readyMasterCount = statuses.filter((item) => item.isReady).length
  const selectedRoleAccess = screenAccessMatrix[selectedRoleTemplate] || {}

  const loadStatuses = async () => {
    setIsStatusLoading(true)
    setStatusError(null)
    try {
      const response = await fetchRequiredMasterDataStatuses()
      setStatuses(response)
    } catch {
      setStatusError('Zorunlu master veri durumu alınamadı.')
    } finally {
      setIsStatusLoading(false)
    }
  }

  useEffect(() => {
    void loadStatuses()
  }, [])

  useEffect(() => {
    if (!needsParent) {
      setParentOptions([])
      setMasterDataForm((prev) => ({ ...prev, parentName: '' }))
      return
    }

    let active = true
    const loadParents = async () => {
      setIsParentLoading(true)
      try {
        const options = await fetchParentOptions(masterDataForm.key)
        if (!active) return
        setParentOptions(options)
        setMasterDataForm((prev) => ({ ...prev, parentName: prev.parentName || options[0]?.name || '' }))
      } finally {
        if (active) setIsParentLoading(false)
      }
    }

    void loadParents()
    return () => {
      active = false
    }
  }, [masterDataForm.key, needsParent])

  const handleCreateMasterData = async () => {
    setMasterDataMessage(null)
    const label = masterDataForm.label.trim()
    if (!label) {
      setMasterDataMessage('Kayıt adı zorunludur.')
      return
    }
    if (needsParent && !masterDataForm.parentName) {
      setMasterDataMessage('Üst kayıt seçimi zorunludur.')
      return
    }

    setIsCreating(true)
    try {
      const createdName = await createRequiredMasterDataEntry({
        key: masterDataForm.key,
        label,
        parentName: masterDataForm.parentName || undefined,
      })
      setMasterDataMessage(`Kayıt oluşturuldu: ${createdName}`)
      setMasterDataForm((prev) => ({ ...prev, label: '' }))
      await loadStatuses()
    } catch {
      setMasterDataMessage('Kayıt oluşturulamadı. Zorunlu alanları kontrol edin.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleScreenAccessChange = async (routeKey: string, isEnabled: boolean) => {
    setIsSavingScreenAccess(true)
    setScreenAccessMessage(null)
    try {
      await onScreenAccessToggle(selectedRoleTemplate, routeKey, isEnabled)
      setScreenAccessMessage('Ekran erişimi güncellendi.')
    } catch {
      setScreenAccessMessage('Ekran erişimi güncellenemedi.')
    } finally {
      setIsSavingScreenAccess(false)
    }
  }

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

      <section className="go-live-panel" aria-labelledby="go-live-readiness-title">
        <div className="setting-group-head">
          <div>
            <h3 id="go-live-readiness-title">Canlı Kullanım Kontrolü</h3>
            <p>
              {readiness.readyCount}/{readiness.totalCount} kontrol hazır
            </p>
          </div>
          <span>{readiness.readyCount === readiness.totalCount ? 'Hazır' : 'Eksik var'}</span>
        </div>
        <div className="readiness-list">
          {readiness.items.map((item) => (
            <div key={item.key} className={item.isReady ? 'readiness-item ready' : 'readiness-item warning'}>
              <strong>{item.isReady ? 'Hazır' : 'Eksik'}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="go-live-panel" aria-labelledby="master-data-readiness-title">
        <div className="setting-group-head">
          <div>
            <h3 id="master-data-readiness-title">Zorunlu Master Veri Yönetimi</h3>
            <p>
              {readyMasterCount}/{REQUIRED_MASTER_DATA_DEFINITIONS.length} kayıt tipi hazır
            </p>
          </div>
          <span>{readyMasterCount === REQUIRED_MASTER_DATA_DEFINITIONS.length ? 'Hazır' : 'Eksik var'}</span>
        </div>

        <div className="readiness-list">
          {statuses.map((item) => (
            <div key={item.key} className={item.isReady ? 'readiness-item ready' : 'readiness-item warning'}>
              <strong>{item.isReady ? 'Hazır' : 'Eksik'}</strong>
              <span>
                {item.label}: {item.count} kayıt
                {item.samples.length ? ` · Örnek: ${item.samples.join(', ')}` : ''}
              </span>
            </div>
          ))}
          {isStatusLoading ? <p className="muted">Master veri durumu yükleniyor...</p> : null}
          {statusError ? <p className="error-text">{statusError}</p> : null}
        </div>

        <div className="form-grid quick-form-grid">
          <label>
            Kayıt Türü
            <select
              value={masterDataForm.key}
              onChange={(event) =>
                setMasterDataForm((prev) => ({
                  ...prev,
                  key: event.target.value as RequiredMasterDataKey,
                  parentName: '',
                }))
              }
            >
              {REQUIRED_MASTER_DATA_DEFINITIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Kayıt Adı
            <input
              value={masterDataForm.label}
              onChange={(event) => setMasterDataForm((prev) => ({ ...prev, label: event.target.value }))}
              placeholder={`${selectedMasterDefinition.label} adı`}
            />
          </label>

          {needsParent ? (
            <label>
              Üst Kayıt
              <select
                value={masterDataForm.parentName}
                onChange={(event) => setMasterDataForm((prev) => ({ ...prev, parentName: event.target.value }))}
              >
                {parentOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="toolbar">
          <button type="button" onClick={handleCreateMasterData} disabled={isCreating || isParentLoading}>
            {isCreating ? 'Oluşturuluyor...' : 'Kaydı Oluştur'}
          </button>
        </div>
        <p className="muted">Bu kayıt tipi şu akışlarda kullanılır: {selectedMasterDefinition.usedBy.join(', ')}</p>
        {masterDataMessage ? <p className="muted">{masterDataMessage}</p> : null}
      </section>

      <section className="go-live-panel" aria-labelledby="screen-access-title">
        <div className="setting-group-head">
          <div>
            <h3 id="screen-access-title">Rol Bazlı Ekran Erişimi</h3>
            <p>Seçilen rol için menü görünürlüğünü ayarlayın.</p>
          </div>
          <span>{selectedRoleTemplate}</span>
        </div>
        <div className="form-grid quick-form-grid">
          <label>
            Rol Şablonu
            <select
              value={selectedRoleTemplate}
              onChange={(event) => setSelectedRoleTemplate(event.target.value as RoleTemplateKey)}
            >
              <option value="yonetici">Yönetici</option>
              <option value="muhasebe_sorumlusu">Muhasebe Sorumlusu</option>
              <option value="satis_operasyon">Satış Operasyon</option>
              <option value="depo_sorumlusu">Depo Sorumlusu</option>
              <option value="salt_okuma">Salt Okuma</option>
            </select>
          </label>
        </div>
        <div className="setting-list">
          {APP_ROUTES.map((route) => (
            <label key={route.key} className="setting-item">
              <div>
                <strong>{route.label}</strong>
                <p>{route.path}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedRoleAccess[route.key] !== false}
                disabled={isSavingScreenAccess}
                onChange={(event) => void handleScreenAccessChange(route.key, event.target.checked)}
              />
            </label>
          ))}
        </div>
        {screenAccessMessage ? <p className="muted">{screenAccessMessage}</p> : null}
      </section>

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
