import { useEffect, useState } from 'react'
import type { RoleTemplateKey } from '../../app/routes'
import type { ActionKey } from './usePermission'
import {
  getActionAccessMatrix,
  getActionLimitMatrix,
  getDefaultActionAccessMatrix,
  saveActionAccessRule,
  saveActionLimitRule,
  type ActionAccessMatrix,
  type ActionLimitMatrix,
} from '../../services/actionPermissionService'

export function useActionPermissionMatrix() {
  const [actionMatrix, setActionMatrix] = useState<ActionAccessMatrix>(getDefaultActionAccessMatrix())
  const [limitMatrix, setLimitMatrix] = useState<ActionLimitMatrix>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getActionAccessMatrix(), getActionLimitMatrix()])
      .then(([nextActionMatrix, nextLimitMatrix]) => {
        if (!active) return
        setActionMatrix(nextActionMatrix)
        setLimitMatrix(nextLimitMatrix)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const setActionRule = async (roleTemplate: RoleTemplateKey, actionKey: ActionKey, isEnabled: boolean) => {
    const next = await saveActionAccessRule(roleTemplate, actionKey, isEnabled)
    setActionMatrix(next)
    return next
  }

  const setLimitRule = async (actionKey: ActionKey, limitValue: number | null) => {
    const next = await saveActionLimitRule(actionKey, limitValue)
    setLimitMatrix(next)
    return next
  }

  return { actionMatrix, limitMatrix, isLoading, setActionRule, setLimitRule }
}
