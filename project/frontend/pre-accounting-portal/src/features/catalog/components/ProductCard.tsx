import type { CatalogItem } from '../types'
import { formatTryCurrency } from '../../../shared/utils/format'

type ProductCardProps = {
  item: CatalogItem
  onClick: (item: CatalogItem) => void
}

export function ProductCard({ item, onClick }: ProductCardProps) {
  const stockStatus = (item.totalQty ?? 0) > 0
  const isLowStock = stockStatus && (item.totalQty ?? 0) < 5

  return (
    <article className="catalog-card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(item)}>
      <div className="catalog-card-image">
        {item.image ? (
          <img src={item.image} alt={item.item_name || item.name} loading="lazy" />
        ) : (
          <div className="catalog-card-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {stockStatus && (
          <span className={`stock-badge ${isLowStock ? 'warning' : 'success'}`}>
            {isLowStock ? 'Düşük' : 'Stokta'}
          </span>
        )}
      </div>
      <div className="catalog-card-content">
        <h3 className="catalog-card-title">{item.item_name || item.name}</h3>
        <p className="catalog-card-group">{item.item_group || 'Kategorisiz'}</p>
        <div className="catalog-card-footer">
          <span className="catalog-card-price">{formatTryCurrency(item.standard_rate ?? 0)}</span>
          {item.totalQty !== undefined && (
            <span className="catalog-card-stock">{item.totalQty} {item.stock_uom || 'adet'}</span>
          )}
        </div>
        {item.brand && (
          <p className="catalog-card-brand">{item.brand}</p>
        )}
      </div>
    </article>
  )
}