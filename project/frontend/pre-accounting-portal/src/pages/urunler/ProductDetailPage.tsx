import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Tag, Layers, Barcode, Info, Box, Truck, MapPin, Edit3, Trash2, PlusCircle } from 'lucide-react'
import type { RoutePageProps } from '../../app/pageProps'
import { erpGet } from '../../services/erpApi'
import { formatTryCurrency } from '../../shared/utils/format'
import { PageSection } from '../../shared/ui/PageSection'
import '../../styles/product-detail.css'

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

export function ProductDetailPage({ settings, onNavigate }: RoutePageProps) {
  const itemCode = new URLSearchParams(window.location.search).get('code') || ''
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
        const response = await erpGet<{ data: ProductDetailData }>(`/resource/Item/${itemCode}`)
        if (!active) return
        setProduct(response.data)
        
        // Mock barcodes or fetch if available in ERPNext
        // setBarcodes([{ barcode: '8691234567890' }])
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
  const stockLevelClass = !stockStatus ? 'danger' : isLowStock ? 'warning' : 'success'

  const handleBack = () => {
    onNavigate('/urunler')
  }

  if (isLoading) {
    return (
      <PageSection title="Ürün Detay" subtitle="">
        <div className="loading-container">
          <p className="muted">Ürün detayları yükleniyor...</p>
        </div>
      </PageSection>
    )
  }

  if (error || !product) {
    return (
      <PageSection title="Ürün Detay" subtitle="">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ArrowLeft size={18} /> Geri Dön
        </button>
        <div className="error-container">
          <p className="error-text">{error || 'Ürün bulunamadı.'}</p>
        </div>
      </PageSection>
    )
  }

  return (
    <PageSection title="Ürün Kartı" subtitle="Ürün detay ve stok bilgileri">
      <div className="product-detail-container">
        <header className="product-detail-header">
          <div className="product-detail-title-group">
            <button type="button" className="back-btn" onClick={handleBack}>
              <ArrowLeft size={18} /> Ürün Listesine Dön
            </button>
            <h2>{product.item_name || product.name}</h2>
            <span className={`status-badge ${product.disabled ? 'passive' : 'active'}`}>
              {product.disabled ? 'Pasif' : 'Aktif'}
            </span>
          </div>
          <div className="product-detail-actions">
            <button type="button" className="btn btn-secondary btn-sm">
              <Edit3 size={16} /> Düzenle
            </button>
            <button type="button" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Stok Hareketi
            </button>
          </div>
        </header>

        <main className="product-hero-section">
          <div className="product-image-container">
            {product.image ? (
              <img src={product.image} alt={product.item_name || product.name} />
            ) : (
              <Package size={120} color="#dee2e6" strokeWidth={1} />
            )}
          </div>

          <div className="product-info-summary">
            <div className="info-cards">
              <div className="info-card price">
                <span className="label">
                  <Tag size={14} /> Birim Fiyat
                </span>
                <span className="value">{formatTryCurrency(product.standard_rate ?? 0)}</span>
              </div>
              <div className={`info-card stock ${stockLevelClass}`}>
                <span className="label">
                  <Box size={14} /> Mevcut Stok
                </span>
                <span className="value">
                  {product.total_qty ?? 0} <small>{product.stock_uom || 'Adet'}</small>
                </span>
              </div>
            </div>

            <div className="details-table-card">
              <h3>Ürün Spesifikasyonları</h3>
              <div className="details-list">
                <div className="detail-row">
                  <span className="label">Ürün Kodu</span>
                  <span className="value">{product.name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ürün Grubu</span>
                  <span className="value">{product.item_group || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Marka</span>
                  <span className="value">{product.brand || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Stok Birimi</span>
                  <span className="value">{product.stock_uom || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Raf Konumu</span>
                  <span className="value">{product.shelf_location || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Son Güncelleme</span>
                  <span className="value">{product.modified ? new Date(product.modified).toLocaleDateString('tr-TR') : '-'}</span>
                </div>
              </div>
            </div>
            
            {barcodes.length > 0 && (
              <div className="details-table-card">
                <h3>Barkod Bilgileri</h3>
                <div className="barcode-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {barcodes.map((bc, idx) => (
                    <span key={idx} className="barcode-badge">
                      <Barcode size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {bc.barcode}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {product.description && (
          <section className="description-section">
            <h3>
              <Info size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Ürün Açıklaması
            </h3>
            <div className="description-content">
              {product.description}
            </div>
          </section>
        )}
      </div>
    </PageSection>
  )
}
