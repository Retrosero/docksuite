import { useEffect, useState } from 'react'
import { fetchCariList } from '../services/cariService'
import type { CariListItem } from '../types'

export function useCariList() {
  const [items, setItems] = useState<CariListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchCariList()
      .then((next) => {
        if (active) setItems(next)
      })
      .catch(() => {
        if (active) setError('Cari verisi alınamadı.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { items, isLoading, error }
}
