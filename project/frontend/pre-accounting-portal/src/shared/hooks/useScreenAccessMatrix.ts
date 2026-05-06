import { useEffect, useState } from 'react'
import { type RoleTemplateKey, type ScreenAccessMatrix } from '../../app/routes'
import { getDefaultScreenAccessMatrix, getScreenAccessMatrix, saveScreenAccessRule } from '../../services/screenAccessService'

export function useScreenAccessMatrix() {
  const [matrix, setMatrix] = useState<ScreenAccessMatrix>(getDefaultScreenAccessMatrix())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getScreenAccessMatrix()
      .then((nextMatrix) => {
        if (active) setMatrix(nextMatrix)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const setRule = async (roleTemplate: RoleTemplateKey, routeKey: string, isEnabled: boolean) => {
    try {
      const nextMatrix = await saveScreenAccessRule(roleTemplate, routeKey, isEnabled)
      setMatrix(nextMatrix)
      return nextMatrix
    } catch {
      const fallback = {
        ...matrix,
        [roleTemplate]: {
          ...(matrix[roleTemplate] || {}),
          [routeKey]: isEnabled,
        },
      } as ScreenAccessMatrix
      setMatrix(fallback)
      return fallback
    }
  }

  return { matrix, isLoading, setRule }
}
