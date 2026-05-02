import type { FeatureSettings } from '../config/featureFlags'

export type RoutePageProps = {
  settings: FeatureSettings
  onToggle: <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => void
}
