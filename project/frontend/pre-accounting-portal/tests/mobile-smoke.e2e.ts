import { expect, type Page, test } from '@playwright/test'

async function mockErpApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url()

    if (url.includes('get_tenant_config')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          message: {
            config: {
              siteName: 'frontend',
              appTitle: 'On Muhasebe Portal',
              plan: 'ticari',
              locale: 'tr',
              currency: 'TRY',
              timezone: 'Europe/Istanbul',
            },
          },
        }),
      })
      return
    }

    if (url.includes('get_feature_settings')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: { settings: {} } }) })
      return
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [] }) })
  })
}

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(2)
}

test.beforeEach(async ({ page }) => {
  await mockErpApi(page)
})

test('mobil route kabugu tasmadan acilir', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('banner')).toContainText('On Muhasebe Portal')
  await expect(page.getByRole('navigation', { name: 'Ana menü' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Diğer sayfalar' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Genel Bakış' })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('satis hizli akis adimlari mobilde gorunur kalir', async ({ page }) => {
  await page.goto('/satis')

  await page.getByRole('button', { name: 'Yeni Fatura' }).click()
  await expect(page.getByRole('button', { name: /Cari ve ürün/ })).toBeVisible()
  await expect(page.getByRole('button', { name: '2 Tutar' })).toBeVisible()
  await expect(page.getByLabel('Müşteri')).toBeVisible()
  await expect(page.getByLabel('Ürün')).toBeVisible()
  await expectNoPageOverflow(page)
})

test('satis teklif akisi mobilde ayar kontrollu acilir', async ({ page }) => {
  await page.goto('/satis')

  await expect(page.getByText('E-belge Hazırlığı')).toBeVisible()
  await expect(page.getByText('İptal ve İade Hazırlığı')).toBeVisible()
  await expect(page.getByText('Teklif Dönüşüm Hazırlığı')).toBeVisible()
  await page.getByRole('button', { name: 'Yeni Teklif' }).click()
  await expect(page.getByRole('button', { name: /Cari ve ürün/ })).toBeVisible()
  await expect(page.getByRole('button', { name: '2 Teklif' })).toBeVisible()
  await expect(page.getByLabel('Müşteri')).toBeVisible()
  await expect(page.getByLabel('Ürün')).toBeVisible()
  await expect(page.getByText('Son Teklifler')).toBeVisible()
  await expectNoPageOverflow(page)
})

test('tahsilat hizli akis ve turkce durumlar korunur', async ({ page }) => {
  await page.goto('/tahsilat')

  await expect(page.getByRole('button', { name: /Fatura seç/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Ödeme al/ })).toBeVisible()
  await expect(page.getByLabel('Müşteri')).toBeVisible()
  await expect(page.getByLabel('Açık Fatura')).toBeVisible()
  await expect(page.getByLabel('Kapanış Durumu')).toBeVisible()
  await expect(page.getByLabel('Kapanış Durumu').locator('option')).toContainText([
    'Tam Kapandı',
    'Kısmi Tahsilat',
  ])
  await expectNoPageOverflow(page)
})

test('gider segmentleri ve odeme akisi mobilde erisilebilir', async ({ page }) => {
  await page.goto('/gider')

  await expect(page.getByRole('tablist', { name: 'Gider işlemi seçimi' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Alış Faturası' })).toBeVisible()
  await page.getByRole('button', { name: 'Tedarikçi Ödemesi' }).click()
  await expect(page.getByRole('button', { name: '1 Tedarikçi' })).toBeVisible()
  await expect(page.getByRole('button', { name: '2 Ödeme' })).toBeVisible()
  await expect(page.getByLabel('Ödenecek Tedarikçi')).toBeVisible()
  await expectNoPageOverflow(page)
})
