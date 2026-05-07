import { useState, useEffect } from 'react'
import { createResource, getResourceList } from '../../services/erpApi'
import { PageSection } from '../../shared/ui/PageSection'
import { fetchWarehouses, addBulkStock } from '../stock/services/stockEntryService'

interface TestDataResult {
  item_name: string
  item_code: string
  price: number
  stock: number
  status: 'success' | 'error'
  error?: string
}

interface BatchResult {
  total: number
  success: number
  failed: number
  items: TestDataResult[]
}

type ItemRow = {
  name: string
  item_name: string
  item_group: string
  stock_uom: string
}

type WarehouseRow = {
  name: string
  warehouse_name?: string
}

export function TestDataGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BatchResult | null>(null)
  const [company, setCompany] = useState('')
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [stockQty, setStockQty] = useState(50)
  const [addStock, setAddStock] = useState(true)

  // Warehouse listesini yükle
  useEffect(() => {
    void (async () => {
      try {
        const wh = await fetchWarehouses()
        setWarehouses(wh)
        if (wh.length > 0) {
          setSelectedWarehouse(wh[0].name)
        }
      } catch (e) {
        console.error('Warehouse yüklenemedi:', e)
      }
    })()
  }, [])

  const runTestDataGenerator = async () => {
    if (!selectedWarehouse) {
      alert('Lütfen bir depo seçin!')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // 1. Aktif ürünleri al
      const items = await getResourceList<ItemRow>('Item', {
        fields: ['name', 'item_name', 'item_group', 'stock_uom'],
        filters: [['disabled', '=', 0]],
        limit: 200,
      })

      if (items.length === 0) {
        alert('Aktif ürün bulunamadı.')
        setLoading(false)
        return
      }

      const results: TestDataResult[] = []
      let successCount = 0
      let failedCount = 0

      // Stok için toplu item listesi
      const stockItems: Array<{ itemCode: string; qty: number; rate?: number }> = []

      // Her ürün için fiyat ve stok girişi
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        try {
          // Gruba göre baz fiyat
          const basePrice = getGroupBasePrice(item.item_group || '')
          const finalPrice = basePrice + ((i + 1) % 50) * 10
          const itemStock = addStock ? stockQty + ((i + 1) % 50) : 0

          // 2. Item Price oluştur
          const itemPricePayload = {
            item_code: item.name,
            price_list: 'Standard Selling',
            price_list_rate: finalPrice,
            currency: 'TRY',
            buying: 0,
            selling: 1,
            uom: item.stock_uom || 'Nos',
          }

          await createResource('Item Price', itemPricePayload)

          // Stok için listeye ekle
          if (addStock) {
            stockItems.push({
              itemCode: item.name,
              qty: itemStock,
              rate: finalPrice,
            })
          }

          results.push({
            item_name: item.item_name || item.name,
            item_code: item.name,
            price: finalPrice,
            stock: itemStock,
            status: 'success',
          })
          successCount++
        } catch (error) {
          results.push({
            item_name: item.item_name || item.name,
            item_code: item.name,
            price: 0,
            stock: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          })
          failedCount++
        }
      }

      // 3. Toplu stok ekle (Stock Entry ile)
      if (stockItems.length > 0 && selectedWarehouse) {
        try {
          console.log(`Stok ekleniyor: ${stockItems.length} ürün, depo: ${selectedWarehouse}`)
          const stockResult = await addBulkStock(stockItems, selectedWarehouse)
          if (stockResult.success) {
            console.log(`Stock Entry oluşturuldu: ${stockResult.name}`)
          } else {
            console.warn('Stock Entry hatası:', stockResult.error)
          }
        } catch (e) {
          console.error('Stok ekleme hatası:', e)
        }
      }

      setResult({
        total: items.length,
        success: successCount,
        failed: failedCount,
        items: results,
      })
    } catch (error) {
      alert(`Genel hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-data-generator">
      <PageSection title="Test Verisi Oluşturucu" subtitle="Ürünlere toplu fiyat ve stok ekleme">
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Tüm aktif ürünlere örnek satış fiyatı ve stok ekler.
            <br />
            <strong>Dikkat:</strong> Bu işlem geri alınamaz!
          </p>

          <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 500 }}>
              Hedef Depo:
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">Depo seçiniz...</option>
              {warehouses.map((wh) => (
                <option key={wh.name} value={wh.name}>
                  {wh.warehouse_name || wh.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="addStock"
              checked={addStock}
              onChange={(e) => setAddStock(e.target.checked)}
            />
            <label htmlFor="addStock">Stok da ekle</label>
          </div>

          {addStock && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Her ürüne eklenecek stok miktarı:
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
                min={1}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}

          <button
            onClick={runTestDataGenerator}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {loading ? 'İşleniyor...' : addStock ? 'Fiyat ve Stok Oluştur' : 'Sadece Fiyat Oluştur'}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: result.failed > 0 ? '#fff3cd' : '#d4edda',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              <strong>Sonuç:</strong> Toplam {result.total} ürün |{' '}
              <span style={{ color: '#28a745' }}>{result.success} başarılı</span> |{' '}
              <span style={{ color: '#dc3545' }}>{result.failed} hatalı</span>
              {addStock && (
                <span> | Stok: Stock Entry ile eklendi</span>
              )}
            </div>

            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Ürün</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Fiyat</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Stok</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{item.item_name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        {item.price > 0 ? `${item.price.toFixed(2)} ₺` : '-'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.stock}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {item.status === 'success' ? (
                          <span style={{ color: '#28a745' }}>✓</span>
                        ) : (
                          <span style={{ color: '#dc3545' }} title={item.error}>
                            ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageSection>
    </div>
  )
}

function getGroupBasePrice(itemGroup: string): number {
  const groupPrices: Record<string, number> = {
    'All Item Groups': 100,
    'Products': 150,
    'Services': 200,
    'Raw Material': 50,
    'Finished Goods': 180,
    'Sub Assemblies': 120,
  }
  return groupPrices[itemGroup] || 100
}