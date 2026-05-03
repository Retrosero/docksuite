import type { FeatureSettings } from '../../../config/featureFlags'
import { useQueryBackedFilter } from '../../../shared/hooks/useQueryBackedFilter'
import { PageSection } from '../../../shared/ui/PageSection'
import { useProductData } from '../hooks/useProductData'

type ProductListScreenProps = {
  settings: FeatureSettings
}

export function ProductListScreen({ settings }: ProductListScreenProps) {
  const [search, setSearch] = useQueryBackedFilter({
    queryKey: 'product_search',
    storageKey: 'product_filter_search',
    defaultValue: '',
  })
  const { products, summary, isLoading, error } = useProductData()
  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const title = `${product.name} ${product.item_name || ''} ${product.item_group || ''}`.toLowerCase()
    return !normalizedSearch || title.includes(normalizedSearch)
  })

  return (
    <PageSection title="Ürünler" subtitle="ERPNext Item kartlarını sade ürün listesi olarak gösterir">
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
          <article className="record-card" key={product.name}>
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
