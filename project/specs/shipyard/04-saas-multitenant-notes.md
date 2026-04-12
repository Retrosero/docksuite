# SaaS Multi-Tenant Notes (Shipyard Product)

## 1) Tenant modeli

- Her musteri = ayri site + ayri veritabani
- Kod tabani = ortak (`core_app` + `shipyard_app`)
- Veri izolasyonu = site seviyesinde dogal izolasyon
- Dagitim modeli = ayni urun birden fazla firmaya tekrar kurulum

## 2) Domain kararlarinda tenant kontrol sorulari

Her yeni yapi icin:

1. Bu model tenant bagimsiz urun mantigi tasiyor mu?
2. Farkli firmalarda ayni sekilde tekrar kullanilabilir mi?
3. Ozellik seviyesinde mi (Custom Field), yoksa tekrar eden islem mi (New DocType)?
4. Veri sadece ilgili tenantin sitesinde mi kalacak?
5. Firma ozel fark gerekiyorsa config ile cozulur mu?

## 3) Tenant-safe tasarim notlari

- Kod icine firma adi, sabit musteri kurali veya ozel surec sabitleri gomulmeyecek.
- Ortak urun davranisi custom app'te tanimlanacak.
- Tenant farklari icin bir sonraki fazda ayar/config mekanizmasi planlanacak.
- Frontend sade katman olacak; cekirdek ERPNext/HRMS is kurali kopyalanmayacak.

## 4) Veri siniri notlari

- Duplicate veri tutulmayacak.
- ERPNext/HRMS cekirdek kayitlari tek gercek kaynak olacak.
- Custom DocType'lar operasyonel gecmis ve iliski kayitlari icin acilacak.
- Tenantlar arasi ortak tablo/veri paylasimi kurulmuyor.

## 5) Release ve operasyon notlari

- Degisiklikler once test/staging tenantta dogrulanmali.
- Uretimde tenant bazli rollout yaklasimi izlenmeli.
- Tag/versiyon disiplini korunmali (`v0.x`, `v1.0.0`).
