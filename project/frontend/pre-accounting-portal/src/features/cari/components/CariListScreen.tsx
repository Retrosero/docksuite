import type { FeatureSettings } from '../../../config/featureFlags'
import { useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { formatTryCurrency } from '../../../shared/utils/format'
import { validateSupplierForm } from '../../../shared/utils/formValidation'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCariList } from '../hooks/useCariList'
import type { SupplierForm } from '../types'

type CariListScreenProps = {
  settings: FeatureSettings
}

export function CariListScreen({ settings }: CariListScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<SupplierForm>({
    supplierName: '',
    supplierType: 'Company',
    supplierGroup: '',
  })
  const [typeFilterRaw, setTypeFilterRaw] = useQueryBackedFilter({
    queryKey: 'cari_type',
    storageKey: 'cari_filter_type',
    defaultValue: 'Hepsi',
    allowedValues: ['Hepsi', 'Müşteri', 'Tedarikçi'],
  })
  const [nameSearch, setNameSearch] = useQueryBackedFilter({
    queryKey: 'cari_name',
    storageKey: 'cari_filter_name',
    defaultValue: '',
  })
  const typeFilter = typeFilterRaw as 'Hepsi' | 'Müşteri' | 'Tedarikçi'
  const { items, supplierGroups, isLoading, isSaving, error, saveSupplier } = useCariList()
  const normalizedNameSearch = nameSearch.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'Hepsi' && item.type !== typeFilter) return false
    if (normalizedNameSearch && !item.name.toLowerCase().includes(normalizedNameSearch)) return false
    return true
  })
  const canCreateSupplier = supplierGroups.length > 0

  const onCreate = async () => {
    setMessage(null)
    const validationError = validateSupplierForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveSupplier(form)
    if (name) {
      setMessage(`Tedarikçi kartı oluşturuldu: ${name}`)
      setForm({ supplierName: '', supplierType: 'Company', supplierGroup: '' })
      setIsCreateOpen(false)
    }
  }

  return (
    <PageSection title="Cari Listesi" subtitle="Müşteri ve tedarikçi bakiyeleri">
      {settings['supplier.allow_quick_create'] ? (
        <div className="toolbar">
          <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
            {isCreateOpen ? 'Formu Kapat' : 'Yeni Tedarikçi'}
          </button>
        </div>
      ) : null}
      {settings['supplier.allow_quick_create'] && isCreateOpen ? (
        <div className="quick-entry-stack card-create-panel">
          {!canCreateSupplier ? (
            <p className="notice">Tedarikçi grubu listesi yüklenmeden tedarikçi kartı oluşturulamaz. Ayarlar {'>'} Zorunlu Master Veri Yönetimi bölümünden tamamlayın.</p>
          ) : null}
          <div className="form-grid quick-form-grid">
            <label>
              Tedarikçi Adı
              <input
                value={form.supplierName}
                onChange={(event) => setForm((prev) => ({ ...prev, supplierName: event.target.value }))}
                placeholder="Ticari unvan veya kişi adı"
              />
            </label>
            <label>
              Tedarikçi Tipi
              <select
                value={form.supplierType}
                onChange={(event) => setForm((prev) => ({ ...prev, supplierType: event.target.value as SupplierForm['supplierType'] }))}
              >
                <option value="Company">Firma</option>
                <option value="Individual">Kişi</option>
              </select>
            </label>
            <label>
              Tedarikçi Grubu
              <select
                value={form.supplierGroup}
                onChange={(event) => setForm((prev) => ({ ...prev, supplierGroup: event.target.value }))}
              >
                <option value="">Seçiniz</option>
                {supplierGroups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={onCreate} disabled={isSaving || !canCreateSupplier}>
            {isSaving ? 'Kaydediliyor...' : 'Tedarikçi Kartını Kaydet'}
          </button>
        </div>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Cari verisi yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="form-grid">
        <label>
          Tip
          <select value={typeFilter} onChange={(event) => setTypeFilterRaw(event.target.value)}>
            <option value="Hepsi">Hepsi</option>
            <option value="Müşteri">Müşteri</option>
            <option value="Tedarikçi">Tedarikçi</option>
          </select>
        </label>
        <label>
          Cari Ara
          <input value={nameSearch} onChange={(event) => setNameSearch(event.target.value)} placeholder="Unvan" />
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unvan</th>
              <th>Tip</th>
              {settings['customer.show_balance_panel'] ? <th>Bakiye</th> : null}
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                {settings['customer.show_balance_panel'] ? <td>{formatTryCurrency(item.balance)}</td> : null}
                <td>{item.status}</td>
              </tr>
            ))}
            {!isLoading && filteredItems.length === 0 ? (
              <tr>
                <td colSpan={settings['customer.show_balance_panel'] ? 4 : 3} className="muted">
                  Filtreye uygun cari kaydı bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </PageSection>
  )
}
