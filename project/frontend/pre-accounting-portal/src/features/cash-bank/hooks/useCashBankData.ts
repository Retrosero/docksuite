import { useEffect, useState } from 'react'
import { fetchCashBankData } from '../services/cashBankService'

type CashBankRow = {
  name: string
  account_name?: string
  account_type?: string
  balance: number
}

export function useCashBankData() {
  const [rows, setRows] = useState<CashBankRow[]>([])
  const [totalCash, setTotalCash] = useState(0)
  const [totalBank, setTotalBank] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchCashBankData()
      .then((data) => {
        if (!active) return
        setRows(data.rows)
        setTotalCash(data.totalCash)
        setTotalBank(data.totalBank)
      })
      .catch(() => {
        if (active) setError('Kasa/Banka verileri alinamadi.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { rows, totalCash, totalBank, isLoading, error }
}
