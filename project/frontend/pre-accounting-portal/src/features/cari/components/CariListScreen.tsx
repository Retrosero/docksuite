import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { formatTryCurrency } from '../../../shared/utils/format'
import { PageSection } from '../../../shared/ui/PageSection'
import { useCariList } from '../hooks/useCariList'

type CariListScreenProps = {
  settings: FeatureSettings
}

export function CariListScreen({ settings }: CariListScreenProps) {
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
  const { items, isLoading, error } = useCariList()
  const normalizedNameSearch = nameSearch.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'Hepsi' && item.type !== typeFilter) return false
    if (normalizedNameSearch && !item.name.toLowerCase().includes(normalizedNameSearch)) return false
    return true
  })

  return (
    <PageSection title="Cari Listesi" subtitle="Müşteri ve tedarikçi bakiyeleri">
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
