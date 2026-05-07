import type { FeatureSettings } from '../../../config/featureFlags'
import { useCatalog } from '../hooks/useCatalog'
import { ProductCard } from './ProductCard'
import { ProductDetailSheet } from './ProductDetailSheet'
import { PageSection } from '../../../shared/ui/PageSection'

type CatalogScreenProps = {
  settings: FeatureSettings
}

export function CatalogScreen({ settings }: CatalogScreenProps) {
  const {
    items,
    itemGroups,
    selectedItem,
    itemBarcodes,
    summary,
    filters,
    isLoading,
    isLoadingDetail,
    error,
    updateFilters,
    clearFilters,
    selectItem,
    closeDetail,
  } = useCatalog()

  const showImages = settings['catalog.show_images'] ?? true

  return (
    <PageSection title="Katalog" subtitle="Hızlı sipariş için ürün görselleri ve bilgileri">
      {/* Arama */}
      <div className="form-grid">
        <label>
          🔍 Ürün Ara
          <input
            type="search"
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Ürün adı, kod veya raf..."
          />
        </label>
      </div>

      {/* Kategori Filtreleri */}
      {itemGroups.length > 0 && (
        <div className="filter-chips">
          <button
            type="button"
            className={`chip ${!filters.item_group ? 'active' : ''}`}
            onClick={() => updateFilters({ item_group: undefined })}
          >
            Tümü
          </button>
          {itemGroups.map((group) => (
            <button
              key={group.name}
              type="button"
              className={`chip ${filters.item_group === group.name ? 'active' : ''}`}
              onClick={() => updateFilters({ item_group: group.name })}
            >
              {group.label}
            </button>
          ))}
        </div>
      )}

      {/* Özet Kartları */}
      <div className="metric-grid">
        <article className="metric-card">
          <h3>Toplam Ürün</h3>
          <strong>{summary.totalItems}</strong>
        </article>
        <article className="metric-card">
          <h3>Stokta Olan</h3>
          <strong>{summary.inStockItems}</strong>
        </article>
        <article className="metric-card alert">
          <h3>Düşük Stok</h3>
          <strong>{summary.lowStockItems}</strong>
        </article>
      </div>

      {/* Hata Mesajı */}
      {error ? <p className="error-text">{error}</p> : null}

      {/* Yükleme */}
      {isLoading ? <p className="muted">Katalog yükleniyor...</p> : null}

      {/* Ürün Grid */}
      {!isLoading && items.length > 0 && (
        <div className={`catalog-grid ${showImages ? 'show-images' : ''}`}>
          {items.map((item) => (
            <ProductCard key={item.name} item={item} onClick={selectItem} />
          ))}
        </div>
      )}

      {/* Boş Durum */}
      {!isLoading && items.length === 0 && (
        <p className="muted">
          {filters.search || filters.item_group
            ? 'Arama kriterlerine uygun ürün bulunamadı.'
            : 'Katalogda ürün bulunamadı.'}
        </p>
      )}

      {/* Filtreleri Temizle */}
      {(filters.search || filters.item_group) && (
        <button type="button" className="ghost" onClick={clearFilters}>
          Filtreleri Temizle
        </button>
      )}

      {/* Ürün Detay Sheet */}
      {selectedItem && (
        <ProductDetailSheet
          item={selectedItem}
          barcodes={itemBarcodes}
          isLoadingBarcodes={isLoadingDetail}
          onClose={closeDetail}
        />
      )}
    </PageSection>
  )
}