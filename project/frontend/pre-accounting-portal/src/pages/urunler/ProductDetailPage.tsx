import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { RoutePageProps } from '../../app/pageProps'
import { erpGet } from '../../services/erpApi'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'

type ProductDetailData = {
  name: string
  item_name?: string
  item_group?: string
  brand?: string
  description?: string
  stock_uom?: string
  total_qty?: number
  standard_rate?: number
  image?: string
  shelf_location?: string
  disabled?: number
  created_on?: string
  modified?: string
}

export function ProductDetailPage({ settings }: RoutePageProps) {
  const [searchParams] = useSearchParams()
  const itemCode = searchParams.get('code') || ''
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [barcodes, setBarcodes] = useState<Array<{ barcode: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemCode) {
      setError('Ürün kodu bulunamadı.')
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)
    setError(null)

    void (async () => {
      try {
        const data = await erpGet<ProductDetailData>(`/resource/Item/${itemCode}`)
        if (!active) return
        setProduct(data)
      } catch (e) {
        if (!active) return
        setError('Ürün detayları yüklenemedi.')
        console.error(e)
      } finally {
        if (active) setIsLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [itemCode])

  const stockStatus = (product?.total_qty ?? 0) > 0
  const isLowStock = stockStatus && (product?.total_qty ?? 0) < 5

  return (
    <PageSection title="Ürün Detay" subtitle="">
      <button type="button" className="ghost" onClick={() => window.history.back()} style={{ marginBottom: '1rem' }}>
        ← Geri
      </button>
      {product && (
        <h2 style={{ marginBottom: '0.5rem' }}>{product.item_name || product.name}</h2>
      )}
      {isLoading ? (
        <p className="muted">Ürün detayları yükleniyor...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : product ? (
        <>
          {/* Görsel */}
          <div className="product-detail-hero">
            {product.image ? (
              <img src={product.image} alt={product.item_name || product.name} />
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

          {/* Fiyat ve Stok */}
          <div className="product-detail-pricing">
            <div className="product-detail-price">
              <span className="label">Fiyat</span>
              <span className="value">{formatTryCurrency(product.standard_rate ?? 0)}</span>
            </div>
            <div className="product-detail-stock">
              <span className="label">Stok</span>
              <span className={`value ${stockStatus ? 'success' : 'error'}`}>
                {stockStatus ? `${product.total_qty} ${product.stock_uom || 'adet'}` : 'Stok yok'}
              </span>
            </div>
          </div>

          {/* Detay Grid */}
          <div className="product-detail-grid">
            <div className="product-detail-item">
              <span className="label">Ürün Kodu</span>
              <span className="value">{product.name}</span>
            </div>
            <div className="product-detail-item">
              <span className="label">Ürün Grubu</span>
              <span className="value">{product.item_group || '-'}</span>
            </div>
            {product.brand && (
              <div className="product-detail-item">
                <span className="label">Marka</span>
                <span className="value">{product.brand}</span>
              </div>
            )}
            <div className="product-detail-item">
              <span className="label">Stok Birimi</span>
              <span className="value">{product.stock_uom || '-'}</span>
            </div>
            {product.shelf_location && (
              <div className="product-detail-item">
                <span className="label">Raf Konumu</span>
                <span className="value">{product.shelf_location}</span>
              </div>
            )}
            <div className="product-detail-item">
              <span className="label">Durum</span>
              <span className="value">{product.disabled ? 'Pasif' : 'Aktif'}</span>
            </div>
          </div>

          {/* Barkodlar */}
          {barcodes.length > 0 && (
            <div className="product-detail-barcodes">
              <span className="label">Barkodlar</span>
              <div className="barcode-list">
                {barcodes.map((bc, idx) => (
                  <span key={idx} className="barcode-item">{bc.barcode}</span>
                ))}
              </div>
            </div>
          )}

          {/* Açıklama */}
          {product.description && (
            <div className="product-detail-description">
              <span className="label">Açıklama</span>
              <p>{product.description}</p>
            </div>
          )}
        </>
      ) : null}
    </PageSection>
  )
}