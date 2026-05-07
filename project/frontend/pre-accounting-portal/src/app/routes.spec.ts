import { describe, expect, it } from 'vitest'
import { APP_ROUTES, findRoute } from './routes'

const REQUIRED_ROUTES = [
  { key: 'dashboard', path: '/' },
  { key: 'cari', path: '/cari' },
  { key: 'musteriler', path: '/musteriler' },
  { key: 'urunler', path: '/urunler' },
  { key: 'satis', path: '/satis' },
  { key: 'tahsilat', path: '/tahsilat' },
  { key: 'alis', path: '/alis' },
  { key: 'gider', path: '/gider' },
  { key: 'kasa-banka', path: '/kasa-banka' },
  { key: 'cek-senet', path: '/cek-senet' },
  { key: 'stok', path: '/stok' },
  { key: 'onaylar', path: '/onaylar' },
  { key: 'raporlar', path: '/raporlar' },
  { key: 'kullanicilar', path: '/kullanicilar' },
  { key: 'gun-sonu', path: '/gun-sonu' },
  { key: 'donem-kapanis', path: '/donem-kapanis' },
  { key: 'e-belge', path: '/e-belge' },
  { key: 'aktarim', path: '/aktarim' },
  { key: 'tenant-yonetimi', path: '/tenant-yonetimi' },
  { key: 'ayarlar', path: '/ayarlar' },
  { key: 'onboarding', path: '/onboarding' },
]

describe('pre-accounting commerce routes', () => {
  it('keeps the required mobile commerce route backbone', () => {
    expect(APP_ROUTES.map(({ key, path }) => ({ key, path }))).toEqual(REQUIRED_ROUTES)
  })

  it('keeps route paths unique', () => {
    const paths = APP_ROUTES.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('falls back to the dashboard for unknown paths', () => {
    expect(findRoute('/bilinmeyen').key).toBe('dashboard')
  })
})
