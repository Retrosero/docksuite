import { useEffect, useState } from 'react'
import { DEFAULT_FEATURE_SETTINGS, type FeatureSettings } from '../../config/featureFlags'
import { getFeatureSettings, updateFeatureSetting } from '../../services/settingsService'

export function useFeatureSettings() {
  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT_FEATURE_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getFeatureSettings()
      .then((loaded) => {
        if (active) setSettings(loaded)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const setSetting = async <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => {
    const next = await updateFeatureSetting(key, value)
    setSettings(next)
  }

  return { settings, isLoading, setSetting }
}
