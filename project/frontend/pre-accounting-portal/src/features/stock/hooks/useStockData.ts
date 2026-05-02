import { useEffect, useState } from 'react'
import { fetchStockData } from '../services/stockService'

type StockTableRow = {
  name: string
  item_name?: string
  item_group?: string
  totalQty: number
}

type StockState = {
  totalItems: number
  activeWarehouses: number
  lowStockCount: number
}

const EMPTY_SUMMARY: StockState = { totalItems: 0, activeWarehouses: 0, lowStockCount: 0 }

export function useStockData() {
  const [summary, setSummary] = useState<StockState>(EMPTY_SUMMARY)
  const [rows, setRows] = useState<StockTableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    fetchStockData()
      .then((result) => {
        if (!active) return
        setSummary(result.summary)
        setRows(result.table)
      })
      .catch(() => {
        if (active) setError('Stok verisi alinamadi.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { summary, rows, isLoading, error }
}
