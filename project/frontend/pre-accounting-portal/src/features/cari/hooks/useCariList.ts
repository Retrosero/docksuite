import { useEffect, useState } from 'react'
import { createSupplierCard, fetchCariList, fetchSupplierGroups } from '../services/cariService'
import type { CariListItem, SupplierForm, SupplierLookupOption } from '../types'

export function useCariList() {
  const [items, setItems] = useState<CariListItem[]>([])
  const [supplierGroups, setSupplierGroups] = useState<SupplierLookupOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (active = true) => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextItems, nextSupplierGroups] = await Promise.all([fetchCariList(), fetchSupplierGroups()])
      if (!active) return
      setItems(nextItems)
      setSupplierGroups(nextSupplierGroups)
    } catch {
      if (active) setError('Cari verisi alınamadı.')
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

  const saveSupplier = async (form: SupplierForm): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createSupplierCard(form)
      await load()
      return name
    } catch {
      setError('Tedarikçi kartı oluşturulamadı. Zorunlu alanları kontrol edin.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  return { items, supplierGroups, isLoading, isSaving, error, saveSupplier }
}
