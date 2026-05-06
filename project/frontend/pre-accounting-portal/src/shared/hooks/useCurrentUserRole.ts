import { useEffect, useState } from 'react'
import { fetchCompanyUsers } from '../../features/users/services/userManagementService'
import type { CompanyUser } from '../../features/users/types'
import type { RoleTemplateKey } from '../../app/routes'

declare const frappe: { session: { user: string } | null }

export function useCurrentUserRole(): { roleTemplate: RoleTemplateKey | null; isLoading: boolean } {
  const [roleTemplate, setRoleTemplate] = useState<RoleTemplateKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const devDefaultRole: RoleTemplateKey = 'yonetici'

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const currentUserEmail = localStorage.getItem('user_email') || (typeof frappe !== 'undefined' ? frappe.session?.user : null)
        if (!currentUserEmail) {
          if (import.meta.env.DEV) {
            setRoleTemplate(devDefaultRole)
          }
          setIsLoading(false)
          return
        }

        const users: CompanyUser[] = await fetchCompanyUsers()
        const currentUser = users.find((u) => u.email === currentUserEmail)

        if (currentUser?.role_template) {
          setRoleTemplate(currentUser.role_template as RoleTemplateKey)
        }
      } catch {
        // Hata durumunda development'ta tum menuleri test edebilmek icin yoneticiye dus.
        if (import.meta.env.DEV) {
          setRoleTemplate(devDefaultRole)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadUserRole()
  }, [])

  return { roleTemplate, isLoading }
}
