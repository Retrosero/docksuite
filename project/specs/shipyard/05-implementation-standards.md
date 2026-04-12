# Shipyard Implementation Standards

Bu dokuman, is ozelligi implementasyonundan once uygulanacak teknik karar standardini tanimlar.
Bu adimda sadece standart ve surec netlestirilir; gercek Custom Field, gercek DocType ve gercek UI implementasyonu yapilmaz.

## 1) Genel Karar Sirasi

1. Istek ozetini cikar.
2. Etkilenen ERPNext standard DocType var mi kontrol et.
3. Ihtiyac sadece mevcut kayda ozellik eklemek mi karar ver.
4. Ihtiyac tekrar eden islem/gecmis/ayri izin/liste gerektiriyor mu karar ver.
5. Sonuca gore:
   - Ozellik genisletmesi: Custom Field
   - Yeni is akis kaydi: New DocType
6. SaaS ve multi-tenant kontrol listesini calistir.
7. Implementasyon once fixture + app mantiginda planlanir.
8. Memory ve specs guncellemeleri tamamlanir.
9. Sadece gercek implementasyon yapildiysa git akisi uygulanir.

## 2) Custom Field Standard Ozeti

- Fieldname standardi: `shipyard_<alan_adi>` (kucuk harf + snake_case).
- Label dili: son kullanici etiketleri Turkce.
- Fieldtype secimi: veri amacina en yakin standart tip kullanilir (`Data`, `Select`, `Check`, `Int`, `Float`, `Date`, `Datetime`, `Small Text`, `Text Editor`, `Link`).
- Ne zaman Custom Field:
  - Var olan ERPNext/Frappe DocType icin yalnizca ek ozellik gerekiyorsa.
  - Ayri gecmis tablosu veya ayri islem listesi gerekmiyorsa.
- Uygulama yontemi:
  - Gelistirme sirasinda hizli dogrulama icin `Customize Form` kullanilabilir.
  - Kalici urun ciktisi icin zorunlu olarak fixture/app'e alinmalidir.
- Multi-tenant tekrar kurulabilirlik:
  - Tenant ozel sabit degerler kod icine gomulmez.
  - Kurulumlar yeni siteye fixture ile tasinabilir olmalidir.
  - Ayni alan tanimi tum tenantlarda calisacak genel urun mantiginda tutulur.

## 3) New DocType Standard Ozeti

- DocType adlandirma: urun genelinde anlamli, tekil ve acik ad kullanilir (ornek mantik: `Shipyard Task`, `Shipyard Field Report`).
- Alan adlandirma: kucuk harf + snake_case.
- Link alanlari:
  - Adlandirma: `<hedef>_ref` (ornek: `employee_ref`, `project_ref`).
  - `options` degeri mutlaka hedef standard/custom DocType adini gostermelidir.
- Child table karari:
  - Tek kayit icinde satir bazli tekrar varsa child table dusun.
  - Kayitlar bagimsiz yasam dongusune sahipse ayri parent DocType dusun.
- Standard DocType iliski:
  - Mumkun oldugunca `Link` alanlariyla ERPNext standart kayitlara baglan.
  - Ayni veriyi ikinci kez tutan duplicate alan olusturma.
- Multi-tenant SaaS ilkesi:
  - Tek firmaya ozel adim, firma adi veya sabit surec kodu modele gomulmez.
  - Tenant farkliliklari config, workflow ayari veya rol/izin katmaninda cozulur.
  - Site bazli veri izolasyonu bozulmaz.

## 4) Memory ve Dokumantasyon Standard Ozeti

- `project/memory/current-custom-fields.md` ne zaman guncellenir:
  - Yeni Custom Field eklendiginde.
  - Mevcut Custom Field degistiginde (fieldtype, label, options, zorunluluk, gorunurluk vb.).
  - Custom Field kaldirildiginda.
- `project/memory/current-doctypes.md` ne zaman guncellenir:
  - Yeni Custom DocType olusturuldugunda.
  - Alan yapisi/iliski/izin mantigi anlamli degistiginde.
  - Child table iliskisi eklendiginde veya kaldirildiginda.
- Specs ne zaman guncellenir:
  - Karar mimarisini etkileyen her degisiklikte.
  - Domain kapsamina yeni modul veya akis girdiginde.
  - Custom Field ve New DocType kararlarinin gerekcesi degistiginde.

## 5) Git Workflow Uygulama Standard Ozeti

- Gercek gelistirme icin branch: `feature/<kisa-konu>`.
- Commit zamani:
  - Calisan ve tutarli bir degisiklik seti tamamlandiginda.
  - Yarým veya sadece not seviyesindeki degisiklikler commit edilmez.
- Merge zamani:
  - Feature dogrulandiktan sonra `develop` branch'ine merge edilir.
  - `main` branch'e dogrudan commit/push yapilmaz.
- Sadece analiz veya sadece markdown uretildiyse:
  - AGENTS kural istisnasina gore commit zorunlu degildir.
- Gercek implementasyon sonrasi zorunlu adimlar:
  1. `git add .`
  2. `git commit -m "<anlamli mesaj>"`
  3. `git push origin feature/<kisa-konu>`
  4. `git checkout develop`
  5. `git merge feature/<kisa-konu>`
  6. `git push origin develop`