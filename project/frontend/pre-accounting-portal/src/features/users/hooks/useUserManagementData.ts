import { useEffect, useState } from 'react'
import {
  createCompanyUser,
  fetchCompanyUsers,
  fetchUserRoleTemplates,
  setCompanyUserEnabled,
  setCompanyUserRoleTemplate,
} from '../services/userManagementService'
import type { CompanyUser, UserCreateForm, UserRoleTemplate } from '../types'

export function useUserManagementData() {
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [templates, setTemplates] = useState<UserRoleTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (active = true) => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextUsers, nextTemplates] = await Promise.all([fetchCompanyUsers(), fetchUserRoleTemplates()])
      if (!active) return
      setUsers(nextUsers)
      setTemplates(nextTemplates)
    } catch {
      if (active) setError('Kullanıcı verileri alınamadı.')
    } finally {
      if (active) setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void load(active)
    return () => {
      active = false
    }
  }, [])

  const saveUser = async (form: UserCreateForm): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const created = await createCompanyUser(form)
      if (!created) return false
      await load()
      return true
    } catch {
      setError('Kullanıcı oluşturulamadı. Alanları veya yetkileri kontrol edin.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const updateUserRole = async (email: string, roleTemplate: string): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const updated = await setCompanyUserRoleTemplate(email, roleTemplate)
      if (!updated) return false
      await load()
      return true
    } catch {
      setError('Kullanıcı rolü güncellenemedi.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const updateUserStatus = async (email: string, enabled: boolean): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const updated = await setCompanyUserEnabled(email, enabled)
      if (!updated) return false
      await load()
      return true
    } catch {
      setError('Kullanıcı durumu güncellenemedi.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return { users, templates, isLoading, isSaving, error, saveUser, updateUserRole, updateUserStatus }
}
