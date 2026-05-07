import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Package, Tag, Box, Edit3, Save, X, Check, Warehouse } from 'lucide-react'
import type { RoutePageProps } from '../../app/pageProps'
import { erpGet } from '../../services/erpApi'
import { formatTryCurrency } from '../../shared/utils/format'
import { getItemPrice, updateItemPrice, getStockBalance, refreshCsrfToken } from '../../features/products/services/productService'

type ProductDetailData = {
  name: string
  item_name?: string
  item_group?: string
  brand?: string
  description?: string
  stock_uom?: string
  image?: string
  shelf_location?: string
  disabled?: number
  modified?: string
}

type EditableProduct = {
  name: string
  item_name: string
  item_group: string
  brand: string
  stock_uom: string
  shelf_location: string
  description: string
  price: number
  currency: string
  stockByWarehouse: { warehouse: string; qty: number }[]
}

export function ProductDetailPage({ onNavigate }: RoutePageProps) {
  const itemCode = new URLSearchParams(window.location.search).get('code') || ''
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [editable, setEditable] = useState<EditableProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

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
        const [itemResponse, priceData, stockData] = await Promise.all([
          erpGet<{ data: ProductDetailData }>(`/resource/Item/${itemCode}`),
          getItemPrice(itemCode),
          getStockBalance(itemCode),
        ])
        if (!active) return

        const item = itemResponse.data
        setProduct(item)
        setEditable({
          name: item.name,
          item_name: item.item_name || item.name,
          item_group: item.item_group || '',
          brand: item.brand || '',
          stock_uom: item.stock_uom || 'Nos',
          shelf_location: item.shelf_location || '',
          description: item.description || '',
          price: priceData?.price ?? 0,
          currency: priceData?.currency || 'TRY',
          stockByWarehouse: stockData,
        })
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

  const totalStock = editable?.stockByWarehouse.reduce((sum, w) => sum + w.qty, 0) ?? 0

  const handleBack = () => {
    onNavigate('/urunler')
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setMessage(null)
    if (product) {
      setEditable({
        name: product.name,
        item_name: product.item_name || product.name,
        item_group: product.item_group || '',
        brand: product.brand || '',
        stock_uom: product.stock_uom || 'Nos',
        shelf_location: product.shelf_location || '',
        description: product.description || '',
        price: editable?.price ?? 0,
        currency: editable?.currency || 'TRY',
        stockByWarehouse: editable?.stockByWarehouse ?? [],
      })
    }
  }

  const handleSave = async () => {
    if (!editable) return
    setIsSaving(true)
    setMessage(null)

    try {
      console.log('Refreshing CSRF token before save...')
      await refreshCsrfToken()
      
      console.log('Saving with:', editable.name, editable.price, editable.currency)
      const priceUpdated = await updateItemPrice(editable.name, editable.price, editable.currency)
      console.log('Update result:', priceUpdated)
      
      if (!priceUpdated) {
        setMessage('Fiyat güncellenemedi.')
        return
      }
      
      setIsEditing(false)
      setMessage('Değişiklikler kaydedildi.')
      
      const priceData = await getItemPrice(editable.name)
      setEditable((prev) => prev ? { ...prev, price: priceData?.price ?? prev.price, currency: priceData?.currency || prev.currency } : null)
    } catch (e) {
      console.error('Save error:', e)
      setMessage('Kaydetme hatası oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (field: keyof EditableProduct, value: string | number) => {
    if (!editable) return
    setEditable((prev) => prev ? { ...prev, [field]: value } : null)
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container" style={{ padding: '2rem' }}>
          <p className="muted">Ürün detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ArrowLeft size={18} /> Geri Dön
        </button>
        <div className="error-container">
          <p className="error-text">{error || 'Ürün bulunamadı.'}</p>
        </div>
      </div>
    )
  }

  const totalQty = editable?.stockByWarehouse.reduce((sum, w) => sum + w.qty, 0) ?? 0
  const stockStatus = totalQty > 0
  const isLowStock = stockStatus && totalQty < 5
  const stockLevelClass = !stockStatus ? 'danger' : isLowStock ? 'warning' : 'success'

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="page-header-top">
          <div className="page-title-group">
            <button type="button" className="back-btn" onClick={handleBack} style={{ marginBottom: 'var(--space-sm)' }}>
              <ArrowLeft size={18} /> Ürün Listesine Dön
            </button>
            <h1 className="page-title">
              <Package size={28} /> {product.item_name || product.name}
            </h1>
            <p className="page-subtitle">Ürün kod: {product.name}</p>
          </div>
          <div className="page-actions">
            {isEditing ? (
              <>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={isSaving}>
                  <X size={16} /> İptal
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
                  <Save size={16} /> {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleEdit}>
                <Edit3 size={16} /> Düzenle
              </button>
            )}
          </div>
        </div>
      </header>

      {message && (
        <div className={`alert ${message.includes('hata') || message.includes('Hata') ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: 'var(--space-lg)' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Tag size={18} /> Fiyat ve Stok Bilgileri</h3>
            {isEditing && <span className="badge badge-info">Düzenleniyor</span>}
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              <div className={`metric-card ${stockLevelClass}`} style={{ padding: 'var(--space-lg)' }}>
                <div className="metric-card-label"><Box size={14} style={{ marginRight: '4px' }} />Mevcut Stok</div>
                <div className="metric-card-value">{totalQty} <small>{product.stock_uom || 'Adet'}</small></div>
                {isLowStock && <div className="metric-card-change down">Düşük stok uyarısı</div>}
              </div>
              <div className="metric-card info" style={{ padding: 'var(--space-lg)' }}>
                <div className="metric-card-label"><Tag size={14} style={{ marginRight: '4px' }} />Birim Fiyat</div>
                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={editable?.price ?? 0}
                      onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                      min={0}
                      step="0.01"
                      style={{ width: '120px' }}
                    />
                    <span>{editable?.currency || 'TRY'}</span>
                  </div>
                ) : (
                  <div className="metric-card-value">{formatTryCurrency(editable?.price ?? 0)}</div>
                )}
              </div>
            </div>

            {editable && editable.stockByWarehouse.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                  <Warehouse size={14} style={{ marginRight: '4px' }} /> Depo Bazlı Stok
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                  {editable.stockByWarehouse.map((w) => (
                    <div key={w.warehouse} className="stat-card" style={{ padding: 'var(--space-md)' }}>
                      <div className="stat-card-icon" style={{ background: 'var(--gray-100)', color: 'var(--text-secondary)' }}>
                        <Warehouse size={18} />
                      </div>
                      <div className="stat-card-content">
                        <div className="stat-card-label">{w.warehouse}</div>
                        <div className="stat-card-value">{w.qty} {product.stock_uom || 'Adet'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ürün Bilgileri</h3>
          </div>
          <div className="card-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label className="form-label">Ürün Adı</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editable?.item_name ?? ''}
                    onChange={(e) => handleFieldChange('item_name', e.target.value)}
                  />
                ) : (
                  <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{product.item_name || product.name}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Ürün Grubu</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editable?.item_group ?? ''}
                    onChange={(e) => handleFieldChange('item_group', e.target.value)}
                  />
                ) : (
                  <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{product.item_group || '-'}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Marka</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editable?.brand ?? ''}
                    onChange={(e) => handleFieldChange('brand', e.target.value)}
                  />
                ) : (
                  <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{product.brand || '-'}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Stok Birimi</label>
                <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{product.stock_uom || 'Nos'}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Raf Konumu</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editable?.shelf_location ?? ''}
                    onChange={(e) => handleFieldChange('shelf_location', e.target.value)}
                  />
                ) : (
                  <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{product.shelf_location || '-'}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Durum</label>
                <span className={`status-pill ${product.disabled ? 'danger' : 'success'}`}>
                  {product.disabled ? 'Pasif' : 'Aktif'}
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Son Güncelleme</label>
                <p style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  {product.modified ? new Date(product.modified).toLocaleDateString('tr-TR') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {product.description && (
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Ürün Açıklaması</h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}