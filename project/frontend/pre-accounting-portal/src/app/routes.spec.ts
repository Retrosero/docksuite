import { describe, expect, it } from 'vitest'
import { APP_ROUTES, findRoute } from './routes'

const REQUIRED_ROUTES = [
  { key: 'dashboard', label: 'Genel Bakış', path: '/' },
  { key: 'cari', label: 'Cari', path: '/cari' },
  { key: 'musteriler', label: 'Müşteriler', path: '/musteriler' },
  { key: 'urunler', label: 'Ürünler', path: '/urunler' },
  { key: 'satis', label: 'Satış', path: '/satis' },
  { key: 'tahsilat', label: 'Tahsilat', path: '/tahsilat' },
  { key: 'alis', label: 'Alış', path: '/alis' },
  { key: 'gider', label: 'Gider', path: '/gider' },
  { key: 'kasa-banka', label: 'Kasa/Banka', path: '/kasa-banka' },
  { key: 'stok', label: 'Stok', path: '/stok' },
  { key: 'raporlar', label: 'Raporlar', path: '/raporlar' },
  { key: 'kullanicilar', label: 'Kullanıcılar', path: '/kullanicilar' },
  { key: 'gun-sonu', label: 'Gün Sonu', path: '/gun-sonu' },
  { key: 'ayarlar', label: 'Ayarlar', path: '/ayarlar' },
]

describe('pre-accounting commerce routes', () => {
  it('keeps the required mobile commerce route backbone', () => {
    expect(APP_ROUTES.map(({ key, label, path }) => ({ key, label, path }))).toEqual(REQUIRED_ROUTES)
  })

  it('keeps route paths unique', () => {
    const paths = APP_ROUTES.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('falls back to the dashboard for unknown paths', () => {
    expect(findRoute('/bilinmeyen').key).toBe('dashboard')
  })
})
