import { useEffect, useMemo, useState } from 'react'
import { buildProductSummary, fetchProducts } from '../services/productService'
import type { ProductItem } from '../types'

export function useProductData() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    fetchProducts()
      .then((rows) => {
        if (active) setProducts(rows)
      })
      .catch(() => {
        if (active) setError('Ürün verileri alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => buildProductSummary(products), [products])

  return { products, summary, isLoading, error }
}
