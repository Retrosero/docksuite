import { describe, expect, it } from 'vitest'
import { buildReportCsv, buildReportExportRows } from './reportsService'

describe('report export helpers', () => {
  it('rapor ozetini csv satirlarina donusturur', () => {
    const rows = buildReportExportRows({
      totalSales: 1000,
      totalPurchases: 400,
      totalCollections: 700,
      totalPayments: 250,
      netBalance: 1050,
    })

    expect(rows).toEqual([
      { baslik: 'Aylık Satış Özeti', tutar: 1000 },
      { baslik: 'Alış Özeti', tutar: 400 },
      { baslik: 'Tahsilat Özeti', tutar: 700 },
      { baslik: 'Ödeme Özeti', tutar: 250 },
      { baslik: 'Net Bakiye', tutar: 1050 },
    ])
  })

  it('turkce basliklari csv formatinda korur', () => {
    const csv = buildReportCsv([{ baslik: 'Aylık Satış Özeti', tutar: 1000 }])

    expect(csv).toBe('Başlık,Tutar\n"Aylık Satış Özeti",1000')
  })
})
