import { useEffect, useMemo, useState } from 'react'
import { buildProductSummary, createProductCard, fetchItemGroups, fetchProducts, fetchUoms } from '../services/productService'
import type { ProductForm, ProductItem, ProductLookupOption } from '../types'

export function useProductData() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [itemGroups, setItemGroups] = useState<ProductLookupOption[]>([])
  const [uoms, setUoms] = useState<ProductLookupOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (active = true) => {
    setIsLoading(true)
    setError(null)
    try {
      const [productRows, groupRows, uomRows] = await Promise.all([fetchProducts(), fetchItemGroups(), fetchUoms()])
      if (!active) return
      setProducts(productRows)
      setItemGroups(groupRows)
      setUoms(uomRows)
    } catch {
      if (active) setError('Ürün verileri alınamadı.')
    } finally {
      if (active) setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void load(active)
    return () => {
      active = false
    }
  }, [])

  const saveProduct = async (form: ProductForm): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createProductCard(form)
      await load()
      return name
    } catch {
      setError('Ürün kartı oluşturulamadı. Zorunlu alanları kontrol edin.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const summary = useMemo(() => buildProductSummary(products), [products])

  return { products, itemGroups, uoms, summary, isLoading, isSaving, error, saveProduct }
}
