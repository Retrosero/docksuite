import { useEffect, useState } from 'react'
import { fetchCatalogItems, fetchCatalogItemGroups, buildCatalogSummary, filterCatalogItems, fetchItemBarcodes } from '../services/catalogService'
import type { CatalogItem, CatalogFilters, CatalogItemGroup, CatalogSummary, CatalogItemBarcode } from '../types'

export function useCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([])
  const [itemGroups, setItemGroups] = useState<CatalogItemGroup[]>([])
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)
  const [itemBarcodes, setItemBarcodes] = useState<CatalogItemBarcode[]>([])
  const [summary, setSummary] = useState<CatalogSummary>({ totalItems: 0, inStockItems: 0, lowStockItems: 0 })
  const [filters, setFilters] = useState<CatalogFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [catalogItems, groups] = await Promise.all([
        fetchCatalogItems(filters).catch((e) => { console.error('Katalog yüklenemedi:', e); return [] }),
        fetchCatalogItemGroups().catch((e) => { console.error('Grup yüklenemedi:', e); return [] }),
      ])
      setItems(catalogItems)
      setFilteredItems(catalogItems)
      setItemGroups(groups)
      setSummary(buildCatalogSummary(catalogItems))
    } catch (err) {
      console.error('Katalog yükleme hatası:', err)
      setError('Katalog yüklenemedi. Lütfen sayfayı yenileyin.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // Filtre değişikliklerinde yeniden filtrele
  useEffect(() => {
    if (items.length > 0) {
      const filtered = filterCatalogItems(items, filters)
      setFilteredItems(filtered)
    }
  }, [filters, items])

  const updateFilters = (newFilters: Partial<CatalogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const selectItem = async (item: CatalogItem) => {
    setSelectedItem(item)
    setIsLoadingDetail(true)
    try {
      const barcodes = await fetchItemBarcodes(item.name)
      setItemBarcodes(barcodes)
    } catch {
      setItemBarcodes([])
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeDetail = () => {
    setSelectedItem(null)
    setItemBarcodes([])
  }

  return {
    items: filteredItems,
    allItems: items,
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
    refresh: load,
  }
}