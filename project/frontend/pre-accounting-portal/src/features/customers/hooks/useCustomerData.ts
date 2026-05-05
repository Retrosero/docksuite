import { useEffect, useMemo, useState } from 'react'
import {
  buildCustomerSummary,
  createCustomerCard,
  fetchCustomerGroups,
  fetchCustomers,
  fetchTerritories,
} from '../services/customerService'
import type { CustomerForm, CustomerItem, CustomerLookupOption } from '../types'

export function useCustomerData() {
  const [customers, setCustomers] = useState<CustomerItem[]>([])
  const [customerGroups, setCustomerGroups] = useState<CustomerLookupOption[]>([])
  const [territories, setTerritories] = useState<CustomerLookupOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (active = true) => {
    setIsLoading(true)
    setError(null)
    try {
      const [customerRows, groupRows, territoryRows] = await Promise.all([
        fetchCustomers(),
        fetchCustomerGroups(),
        fetchTerritories(),
      ])
      if (!active) return
      setCustomers(customerRows)
      setCustomerGroups(groupRows)
      setTerritories(territoryRows)
    } catch {
      if (active) setError('Müşteri verileri alınamadı.')
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

  const saveCustomer = async (form: CustomerForm): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const name = await createCustomerCard(form)
      await load()
      return name
    } catch {
      setError('Müşteri kartı oluşturulamadı. Zorunlu alanları kontrol edin.')
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const summary = useMemo(() => buildCustomerSummary(customers), [customers])

  return { customers, customerGroups, territories, summary, isLoading, isSaving, error, saveCustomer }
}
