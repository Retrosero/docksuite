import type { FeatureSettings } from '../../../config/featureFlags'
import { useState } from 'react'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { validateProductForm } from '../../../shared/utils/formValidation'
import { useProductData } from '../hooks/useProductData'
import type { ProductForm } from '../types'

type ProductListScreenProps = {
  settings: FeatureSettings
}

export function ProductListScreen({ settings }: ProductListScreenProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>({
    itemCode: '',
    itemName: '',
    itemGroup: '',
    stockUom: '',
    isStockItem: true,
  })
  const [search, setSearch] = useQueryBackedFilter({
    queryKey: 'product_search',
    storageKey: 'product_filter_search',
    defaultValue: '',
  })
  const { products, itemGroups, uoms, summary, isLoading, isSaving, error, saveProduct } = useProductData()
  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const title = `${product.name} ${product.item_name || ''} ${product.item_group || ''}`.toLowerCase()
    return !normalizedSearch || title.includes(normalizedSearch)
  })
  const canCreateProduct = itemGroups.length > 0 && uoms.length > 0

  const onCreate = async () => {
    setMessage(null)
    const validationError = validateProductForm(form)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const name = await saveProduct(form)
    if (name) {
      setMessage(`Ürün kartı oluşturuldu: ${name}`)
      setForm({ itemCode: '', itemName: '', itemGroup: '', stockUom: '', isStockItem: true })
      setIsCreateOpen(false)
    }
  }

  return (
    <PageSection title="Ürünler" subtitle="ERPNext Item kartlarını sade ürün listesi olarak gösterir">
      {settings['product.allow_quick_create'] ? (
        <div className="toolbar">
          <button type="button" onClick={() => setIsCreateOpen((value) => !value)}>
            {isCreateOpen ? 'Formu Kapat' : 'Yeni Ürün'}
          </button>
        </div>
      ) : null}
      {settings['product.allow_quick_create'] && isCreateOpen ? (
        <div className="quick-entry-stack card-create-panel">
          {!canCreateProduct ? (
            <p className="notice">Ürün grubu ve stok birimi listeleri yüklenmeden ürün kartı oluşturulamaz. Ayarlar {' > '} Zorunlu Master Veri Yönetimi bölümünden tamamlayın.</p>
          ) : null}
          <div className="form-grid quick-form-grid">
            <label>
              Ürün Kodu
              <input
                value={form.itemCode}
                onChange={(event) => setForm((prev) => ({ ...prev, itemCode: event.target.value }))}
                placeholder="URUN-001"
              />
            </label>
            <label>
              Ürün Adı
              <input
                value={form.itemName}
                onChange={(event) => setForm((prev) => ({ ...prev, itemName: event.target.value }))}
                placeholder="Ürün adı"
              />
            </label>
            <label>
              Ürün Grubu
              <select value={form.itemGroup} onChange={(event) => setForm((prev) => ({ ...prev, itemGroup: event.target.value }))}>
                <option value="">Seçiniz</option>
                {itemGroups.map((group) => (
                  <option key={group.name} value={group.name}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stok Birimi
              <select value={form.stockUom} onChange={(event) => setForm((prev) => ({ ...prev, stockUom: event.target.value }))}>
                <option value="">Seçiniz</option>
                {uoms.map((uom) => (
                  <option key={uom.name} value={uom.name}>
                    {uom.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isStockItem}
                onChange={(event) => setForm((prev) => ({ ...prev, isStockItem: event.target.checked }))}
              />
              Stoklu ürün
            </label>
          </div>
          <button type="button" onClick={onCreate} disabled={isSaving || !canCreateProduct}>
            {isSaving ? 'Kaydediliyor...' : 'Ürün Kartını Kaydet'}
          </button>
        </div>
      ) : null}
      {message ? <p className="muted">{message}</p> : null}
      {isLoading ? <p className="muted">Ürünler yükleniyor...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Ürün</h3>
          <strong>{summary.totalProducts}</strong>
        </article>
        <article className="metric-card">
          <h3>Aktif Ürün</h3>
          <strong>{summary.activeProducts}</strong>
        </article>
        <article className="metric-card alert">
          <h3>Düşük Stok</h3>
          <strong>{summary.lowStockProducts}</strong>
        </article>
      </div>
      <div className="form-grid">
        <label>
          Ürün Ara
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kod, ad veya grup" />
        </label>
      </div>
      <div className="record-list">
        {filteredProducts.map((product) => (
          <article className="record-card" key={product.name} onClick={() => window.location.href = `/urun-detay?code=${product.name}`} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/urun-detay?code=${product.name}`)}>
            <div>
              <strong>{product.item_name || product.name}</strong>
              <span>{product.name} · {product.item_group || 'Grup yok'}</span>
            </div>
            <div>
              <span>{product.totalQty} {product.stock_uom || ''}</span>
              {settings['product.show_stock_badges'] ? (
                <span className={product.totalQty < 5 ? 'status-pill warning' : 'status-pill success'}>
                  {product.totalQty < 5 ? 'Düşük' : 'Yeterli'}
                </span>
              ) : null}
            </div>
          </article>
        ))}
        {!isLoading && filteredProducts.length === 0 ? <p className="muted">Filtreye uygun ürün bulunamadı.</p> : null}
      </div>
    </PageSection>
  )
}
