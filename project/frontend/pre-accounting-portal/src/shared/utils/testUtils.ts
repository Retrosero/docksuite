// =============================================================================
// Faz M: Test Ortami ve Demo Data - Frontend Utilities
// =============================================================================

export interface DemoDataStatus {
  company: boolean
  customers: number
  suppliers: number
  items: number
  invoices: number
}

export interface CreateDemoResult {
  status: string
  created?: string[]
  count?: number
  message?: string
  company?: string
}

// Demo veri endpoint'leri
const TEST_ENDPOINTS = {
  status: '/method/shipyard_app.pre_accounting_test_data.get_test_status',
  create_company: '/method/shipyard_app.pre_accounting_test_data.create_demo_company',
  create_customers: '/method/shipyard_app.pre_accounting_test_data.create_demo_customers',
  create_suppliers: '/method/shipyard_app.pre_accounting_test_data.create_demo_suppliers',
  create_items: '/method/shipyard_app.pre_accounting_test_data.create_demo_items',
  seed_invoices: '/method/shipyard_app.pre_accounting_test_data.seed_demo_invoices',
  reset: '/method/shipyard_app.pre_accounting_test_data.reset_demo_data',
}

/**
 * Test ortami durumunu getirir
 */
export async function getTestStatus(): Promise<DemoDataStatus> {
  const response = await fetch(`${TEST_ENDPOINTS.status}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Demo sirket olusturur
 */
export async function createDemoCompany(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.create_company}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Demo musteriler olusturur
 */
export async function createDemoCustomers(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.create_customers}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Demo tedarikciler olusturur
 */
export async function createDemoSuppliers(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.create_suppliers}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Demo urunler olusturur
 */
export async function createDemoItems(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.create_items}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Demo faturalar olusturur
 */
export async function seedDemoInvoices(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.seed_invoices}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Tum demo verileri siler
 */
export async function resetDemoData(): Promise<CreateDemoResult> {
  const response = await fetch(`${TEST_ENDPOINTS.reset}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return response.json()
}

/**
 * Tum demo verileri sirasila olusturur
 */
export async function setupFullDemoData(): Promise<{
  company?: string
  customers?: string[]
  suppliers?: string[]
  items?: string[]
  invoices?: number
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    // 1. Sirket
    const companyResult = await createDemoCompany()
    if (companyResult.status !== 'ok' && companyResult.status !== 'created') {
      if (companyResult.status === 'error') {
        errors.push('Sirket: ' + (companyResult.message || 'bilinmeyen hata'))
      }
    }
    
    // 2. Musteriler
    try {
      await createDemoCustomers()
    } catch {
      errors.push('Musteri olusturma hatasi')
    }
    
    // 3. Tedarikciler
    try {
      await createDemoSuppliers()
    } catch {
      errors.push('Tedarikci olusturma hatasi')
    }
    
    // 4. Urunler
    try {
      await createDemoItems()
    } catch {
      errors.push('Urun olusturma hatasi')
    }
    
    // 5. Faturalar
    try {
      await seedDemoInvoices()
    } catch {
      errors.push('Fatura olusturma hatasi')
    }
    
    // Final durumu
    const finalStatus = await getTestStatus()
    
    return {
      company: finalStatus.company ? 'DEMO-TERSANE-001' : undefined,
      customers: finalStatus.customers > 0 ? [`${finalStatus.customers} musteri`] : undefined,
      suppliers: finalStatus.suppliers > 0 ? [`${finalStatus.suppliers} tedarikci`] : undefined,
      items: finalStatus.items > 0 ? [`${finalStatus.items} urun`] : undefined,
      invoices: finalStatus.invoices,
      errors,
    }
  } catch (err) {
    errors.push('Genel hata: ' + String(err))
    return { errors }
  }
}

// Mock data generators
export function generateMockInvoice(id: number) {
  return {
    id: `INV-${String(id).padStart(5, '0')}`,
    customer: ['XYZ Gemi Yapim Ltd.', 'ABC Denizcilik A.S.', 'DEF Lojistik Tic.'][id % 3],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 100000) + 10000,
    status: ['Draft', 'Submitted', 'Paid'][id % 3],
    type: 'Sales Invoice',
  }
}

export function generateMockDashboardData() {
  return {
    totalReceivables: Math.floor(Math.random() * 1000000) + 100000,
    totalPayables: Math.floor(Math.random() * 500000) + 50000,
    pendingApprovals: Math.floor(Math.random() * 20),
    monthlyRevenue: Math.floor(Math.random() * 500000) + 50000,
    collectionRate: Math.floor(Math.random() * 30) + 70,
  }
}