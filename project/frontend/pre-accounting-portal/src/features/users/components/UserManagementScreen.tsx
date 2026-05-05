import { useMemo, useState } from 'react'
import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { useUserManagementData } from '../hooks/useUserManagementData'
import type { UserCreateForm } from '../types'

type UserManagementScreenProps = {
  settings: FeatureSettings
}

function validateUserCreateForm(form: UserCreateForm): string | null {
  if (!form.email.trim() || !form.firstName.trim() || !form.roleTemplate) {
    return 'Lütfen e-posta, ad ve rol şablonu alanlarını doldurun.'
  }
  return null
}

export function UserManagementScreen({ settings }: UserManagementScreenProps) {
  const [form, setForm] = useState<UserCreateForm>({
    email: '',
    firstName: '',
    lastName: '',
    roleTemplate: '',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [search, setSearch] = useQueryBackedFilter({
    queryKey: 'user_search',
    storageKey: 'user_filter_search',
    defaultValue: '',
  })

  const { users, templates, isLoading, isSaving, error, saveUser, updateUserRole, updateUserStatus } = useUserManagementData()
  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const text = `${user.full_name} ${user.email}`.toLowerCase()
        return !normalizedSearch || text.includes(normalizedSearch)
      }),
    [users, normalizedSearch],
  )

  const onCreate = async () => {
    setMessage(null)
    const validationError = validateUserCreateForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const ok = await saveUser(form)
    if (!ok) return
    setMessage(`Kullanıcı oluşturuldu: ${form.email}`)
    setForm({ email: '', firstName: '', lastName: '', roleTemplate: '' })
  }

  return (
    <PageSection title="Kullanıcılar" subtitle="Firma içi personel ekleme ve yetki kısıtları">
      {!settings['security.enable_user_management_panel'] ? (
        <p className="notice">Bu tenant planında kullanıcı yönetimi paneli kapalıdır.</p>
      ) : null}
      {settings['security.enable_user_management_panel'] ? (
        <div className="card-create-panel quick-entry-stack">
          <div className="form-grid quick-form-grid">
            <label>
              E-posta
              <input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="kullanici@firma.com"
              />
            </label>
            <label>
              Ad
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="Ad"
              />
            </label>
            <label>
              Soyad
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="Soyad"
              />
            </label>
            <label>
              Rol Şablonu
              <select
                value={form.roleTemplate}
                onChange={(event) => setForm((prev) => ({ ...prev, roleTemplate: event.target.value }))}
              >
                <option value="">Seçiniz</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={onCreate} disabled={isSaving || !settings['security.enable_user_management_panel']}>
            {isSaving ? 'Kaydediliyor...' : 'Kullanıcı Oluştur'}
          </button>
        </div>
      ) : null}
      {message ? <p className="success-text">{message}</p> : null}
      {isLoading ? <p className="muted">Kullanıcı verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="form-grid">
        <label>
          Kullanıcı Ara
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ad veya e-posta" />
        </label>
      </div>

      <div className="record-list">
        {filteredUsers.map((user) => (
          <article className="record-card" key={user.email}>
            <div>
              <strong>{user.full_name}</strong>
              <span>{user.email}</span>
              <span>{user.managed_roles.join(', ') || 'Rol atanmadı'}</span>
            </div>
            <div className="quick-entry-stack">
              <select
                value={user.role_template ?? ''}
                onChange={(event) => {
                  if (!event.target.value) return
                  void updateUserRole(user.email, event.target.value)
                }}
                disabled={isSaving || !settings['security.enable_user_management_panel']}
              >
                <option value="">Rol Şablonu</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ghost"
                onClick={() => void updateUserStatus(user.email, !user.enabled)}
                disabled={isSaving || !settings['security.enable_user_management_panel']}
              >
                {user.enabled ? 'Pasife Al' : 'Aktif Et'}
              </button>
              <span className={user.enabled ? 'status-pill success' : 'status-pill warning'}>
                {user.enabled ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </article>
        ))}
        {!isLoading && filteredUsers.length === 0 ? <p className="muted">Filtreye uygun kullanıcı bulunamadı.</p> : null}
      </div>
    </PageSection>
  )
}
