import { useState } from 'react'
import type { CatalogItem, CatalogItemBarcode } from '../types'
import { formatTryCurrency } from '../../../shared/utils/format'

type ProductDetailSheetProps = {
  item: CatalogItem
  barcodes: CatalogItemBarcode[]
  isLoadingBarcodes: boolean
  onClose: () => void
  onAddToCart?: (item: CatalogItem) => void
}

export function ProductDetailSheet({ item, barcodes, isLoadingBarcodes, onClose, onAddToCart }: ProductDetailSheetProps) {
  const [qty, setQty] = useState(1)
  const stockStatus = (item.totalQty ?? 0) > 0

  const decreaseQty = () => setQty((prev) => Math.max(1, prev - 1))
  const increaseQty = () => setQty((prev) => prev + 1)

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ ...item, totalQty: qty } as CatalogItem)
    }
  }

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="product-detail-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Görsel */}
        <div className="product-detail-image">
          {item.image ? (
            <img src={item.image} alt={item.item_name || item.name} />
          ) : (
            <div className="product-detail-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Başlık */}
        <div className="product-detail-header">
          <h2>{item.item_name || item.name}</h2>
          <p className="product-detail-category">{item.item_group || 'Kategorisiz'}</p>
          <p className="product-detail-code">{item.name}</p>
        </div>

        {/* Fiyat ve Stok */}
        <div className="product-detail-pricing">
          <div className="product-detail-price">
            <span className="label">Fiyat</span>
            <span className="value">{formatTryCurrency(item.standard_rate ?? 0)}</span>
          </div>
          <div className="product-detail-stock">
            <span className="label">Stok</span>
            <span className={`value ${stockStatus ? 'success' : 'error'}`}>
              {stockStatus ? `${item.totalQty} ${item.stock_uom || 'adet'}` : 'Stok yok'}
            </span>
          </div>
        </div>

        {/* Detay Bilgiler Grid */}
        <div className="product-detail-grid">
          {item.shelf_location && (
            <div className="product-detail-item">
              <span className="label">📍 Raf</span>
              <span className="value">{item.shelf_location}</span>
            </div>
          )}
          {item.units_per_carton && (
            <div className="product-detail-item">
              <span className="label">📦 Koli</span>
              <span className="value">{item.units_per_carton} adet</span>
            </div>
          )}
          {item.packaging_type && (
            <div className="product-detail-item">
              <span className="label">📋 Ambalaj</span>
              <span className="value">{item.packaging_type}</span>
            </div>
          )}
          {item.brand && (
            <div className="product-detail-item">
              <span className="label">🏷️ Marka</span>
              <span className="value">{item.brand}</span>
            </div>
          )}
          {item.stock_uom && (
            <div className="product-detail-item">
              <span className="label">📏 Birim</span>
              <span className="value">{item.stock_uom}</span>
            </div>
          )}
        </div>

        {/* Barkodlar */}
        {(barcodes.length > 0 || isLoadingBarcodes) && (
          <div className="product-detail-barcodes">
            <span className="label">📋 Barkod</span>
            {isLoadingBarcodes ? (
              <span className="loading">Yükleniyor...</span>
            ) : (
              <div className="barcode-list">
                {barcodes.map((bc, idx) => (
                  <span key={idx} className="barcode-item">{bc.barcode}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Açıklama */}
        {item.description && (
          <div className="product-detail-description">
            <span className="label">📝 Açıklama</span>
            <p>{item.description}</p>
          </div>
        )}

        {/* Hızlı Sepet */}
        {stockStatus && onAddToCart && (
          <div className="product-detail-cart">
            <div className="qty-selector">
              <button type="button" onClick={decreaseQty} disabled={qty <= 1}>-</button>
              <span>{qty}</span>
              <button type="button" onClick={increaseQty}>+</button>
            </div>
            <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>
             _SEPETE EKLE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}