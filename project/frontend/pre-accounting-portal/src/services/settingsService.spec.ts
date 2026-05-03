import { describe, expect, it } from 'vitest'
import { DEFAULT_FEATURE_SETTINGS } from '../config/featureFlags'
import { mergeFeatureSettings } from './settingsService'

describe('settings service helpers', () => {
  it('fills missing tenant settings with product defaults', () => {
    expect(
      mergeFeatureSettings({
        'mobile.enable_quick_collection': true,
      }),
    ).toEqual({
      ...DEFAULT_FEATURE_SETTINGS,
      'mobile.enable_quick_collection': true,
    })
  })

  it('keeps defaults when backend returns no settings payload', () => {
    expect(mergeFeatureSettings()).toEqual(DEFAULT_FEATURE_SETTINGS)
  })
})
