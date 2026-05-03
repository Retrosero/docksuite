import { DEFAULT_FEATURE_SETTINGS, type FeatureSettings } from '../config/featureFlags'
import { erpGet, erpPost } from './erpApi'

const STORAGE_KEY = 'pre-accounting-feature-settings'
const GET_SETTINGS_ENDPOINT = '/method/shipyard_app.pre_accounting_api.get_feature_settings'
const SAVE_SETTING_ENDPOINT = '/method/shipyard_app.pre_accounting_api.save_feature_setting'

type FeatureSettingsResponse = {
  message?: {
    settings?: Partial<FeatureSettings>
  }
}

type SaveFeatureSettingPayload = {
  key: string
  value: boolean
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function mergeFeatureSettings(settings?: Partial<FeatureSettings>): FeatureSettings {
  return { ...DEFAULT_FEATURE_SETTINGS, ...settings }
}

async function getLocalFeatureSettings(): Promise<FeatureSettings> {
  const storage = getLocalStorage()
  if (!storage) return DEFAULT_FEATURE_SETTINGS

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_FEATURE_SETTINGS

  try {
    const parsed = JSON.parse(raw) as Partial<FeatureSettings>
    return mergeFeatureSettings(parsed)
  } catch {
    return DEFAULT_FEATURE_SETTINGS
  }
}

function saveLocalFeatureSettings(settings: FeatureSettings): void {
  const storage = getLocalStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export async function getFeatureSettings(): Promise<FeatureSettings> {
  try {
    const response = await erpGet<FeatureSettingsResponse>(GET_SETTINGS_ENDPOINT)
    const settings = mergeFeatureSettings(response.message?.settings)
    saveLocalFeatureSettings(settings)
    return settings
  } catch {
    return getLocalFeatureSettings()
  }
}

export async function updateFeatureSetting<K extends keyof FeatureSettings>(
  key: K,
  value: FeatureSettings[K],
): Promise<FeatureSettings> {
  try {
    const response = await erpPost<FeatureSettingsResponse, SaveFeatureSettingPayload>(SAVE_SETTING_ENDPOINT, {
      key,
      value,
    })
    const settings = mergeFeatureSettings(response.message?.settings)
    saveLocalFeatureSettings(settings)
    return settings
  } catch {
    const current = await getLocalFeatureSettings()
    const next = { ...current, [key]: value }
    saveLocalFeatureSettings(next)
    return next
  }
}
