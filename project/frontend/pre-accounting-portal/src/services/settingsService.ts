import { DEFAULT_FEATURE_SETTINGS, type FeatureSettings } from '../config/featureFlags'

const STORAGE_KEY = 'pre-accounting-feature-settings'

export async function getFeatureSettings(): Promise<FeatureSettings> {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_FEATURE_SETTINGS

  try {
    const parsed = JSON.parse(raw) as Partial<FeatureSettings>
    return { ...DEFAULT_FEATURE_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_FEATURE_SETTINGS
  }
}

export async function updateFeatureSetting<K extends keyof FeatureSettings>(
  key: K,
  value: FeatureSettings[K],
): Promise<FeatureSettings> {
  const current = await getFeatureSettings()
  const next = { ...current, [key]: value }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
