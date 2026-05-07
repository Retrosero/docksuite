import { useEffect, useState, useCallback } from 'react'
import { fetchDetailedAgingReport, type DetailedAgingReport, calculateRiskScore, type DetailedAgingItem } from '../services/detailedAgingService'

const EMPTY_REPORT: DetailedAgingReport = {
  as_of_date: '',
  customers: [],
  suppliers: [],
  total_customer_outstanding: 0,
  total_supplier_outstanding: 0,
  total_outstanding: 0,
  high_risk_count: 0,
  medium_risk_count: 0,
  low_risk_count: 0,
}

function generateMockAgingReport(): DetailedAgingReport {
  const mockCustomers: DetailedAgingItem[] = [
    {
      party_name: 'ABC Şirketi A.Ş.',
      party_type: 'Customer',
      total_outstanding: 125000,
      buckets: { current: 45000, '1_30': 35000, '31_60': 25000, '61_90': 15000, over_90: 5000 },
      oldest_invoice_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'low',
    },
    {
      party_name: 'XYZ Mühendislik Ltd.',
      party_type: 'Customer',
      total_outstanding: 78000,
      buckets: { current: 12000, '1_30': 18000, '31_60': 22000, '61_90': 18000, over_90: 8000 },
      oldest_invoice_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'medium',
    },
    {
      party_name: 'Teknoloji Holding A.Ş.',
      party_type: 'Customer',
      total_outstanding: 245000,
      buckets: { current: 80000, '1_30': 65000, '31_60': 55000, '61_90': 30000, over_90: 15000 },
      oldest_invoice_date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'high',
    },
    {
      party_name: 'Enerji Sistemleri San.',
      party_type: 'Customer',
      total_outstanding: 34000,
      buckets: { current: 18000, '1_30': 12000, '31_60': 3000, '61_90': 1000, over_90: 0 },
      oldest_invoice_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'low',
    },
  ]

  const mockSuppliers: DetailedAgingItem[] = [
    {
      party_name: 'Malzeme Tedarikçisi A.Ş.',
      party_type: 'Supplier',
      total_outstanding: 89000,
      buckets: { current: 35000, '1_30': 28000, '31_60': 18000, '61_90': 6000, over_90: 2000 },
      oldest_invoice_date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'low',
    },
    {
      party_name: 'Parça Üreticileri Ltd.',
      party_type: 'Supplier',
      total_outstanding: 56000,
      buckets: { current: 15000, '1_30': 18000, '31_60': 15000, '61_90': 6000, over_90: 2000 },
      oldest_invoice_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      risk_score: 'low',
    },
  ]

  // Calculate risk scores
  mockCustomers.forEach(customer => {
    customer.risk_score = calculateRiskScore(customer)
  })
  mockSuppliers.forEach(supplier => {
    supplier.risk_score = calculateRiskScore(supplier)
  })

  const totalCustomerOutstanding = mockCustomers.reduce((sum, c) => sum + c.total_outstanding, 0)
  const totalSupplierOutstanding = mockSuppliers.reduce((sum, s) => sum + s.total_outstanding, 0)

  return {
    as_of_date: new Date().toISOString().split('T')[0],
    customers: mockCustomers,
    suppliers: mockSuppliers,
    total_customer_outstanding: totalCustomerOutstanding,
    total_supplier_outstanding: totalSupplierOutstanding,
    total_outstanding: totalCustomerOutstanding + totalSupplierOutstanding,
    high_risk_count: mockCustomers.filter(c => c.risk_score === 'high').length,
    medium_risk_count: mockCustomers.filter(c => c.risk_score === 'medium').length,
    low_risk_count: mockCustomers.filter(c => c.risk_score === 'low').length,
  }
}

interface UseDetailedAgingOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useDetailedAging(options: UseDetailedAgingOptions = {}) {
  const { autoRefresh = false, refreshInterval = 300000 } = options

  const [report, setReport] = useState<DetailedAgingReport>(EMPTY_REPORT)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers')

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      try {
        const data = await fetchDetailedAgingReport()
        setReport(data)
      } catch {
        // Backend not available, use mock data
        const mockReport = generateMockAgingReport()
        setReport(mockReport)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vade analizi raporu yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadReport, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadReport])

  const refresh = useCallback(() => {
    loadReport()
  }, [loadReport])

  const switchTab = useCallback((tab: 'customers' | 'suppliers') => {
    setActiveTab(tab)
  }, [])

  return {
    report,
    isLoading,
    error,
    activeTab,
    refresh,
    switchTab,
  }
}