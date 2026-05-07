import { describe, expect, it } from 'vitest'
import { parseBankStatementCsv } from './bankReconciliationService'

describe('bank reconciliation csv parsing', () => {
  it('parses semicolon based bank statement rows', () => {
    const csv = [
      'Tarih;Aciklama;Tutar',
      '2026-05-01;Musteri Tahsilati;1250,50',
      '2026-05-02;Tedarikci Odeme;-300,00',
    ].join('\n')

    const rows = parseBankStatementCsv(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      date: '2026-05-01',
      description: 'Musteri Tahsilati',
      amount: 1250.5,
    })
    expect(rows[1].amount).toBe(-300)
  })

  it('returns empty list when required columns are missing', () => {
    const csv = ['Tarih;Not', '2026-05-01;Ornek satir'].join('\n')
    expect(parseBankStatementCsv(csv)).toEqual([])
  })
})
