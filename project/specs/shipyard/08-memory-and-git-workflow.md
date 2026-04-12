# Memory ve Git Workflow Standardi

Bu dokuman, implementasyon sonrasinda hangi bilginin nereye kaydedilecegini ve git akisinin ne zaman calistirilacagini netlestirir.

## 1) Memory Guncelleme Standardi

### `project/memory/current-custom-fields.md`
Asagidaki degisikliklerden hemen sonra guncellenir:
- Yeni Custom Field eklendi.
- Mevcut Custom Field alan yapisi degisti (fieldtype, label, options, required, default, read_only, hidden, depends_on vb.).
- Custom Field kaldirildi veya deprecated edildi.

Kayit formati onerisi:
- Hedef DocType
- Fieldname
- Fieldtype
- Label
- Durum (active/deprecated/planned)
- Not (tenant-safe veya config notu)

### `project/memory/current-doctypes.md`
Asagidaki degisikliklerden hemen sonra guncellenir:
- Yeni Custom DocType olusturuldu.
- DocType'a kritik alanlar eklendi/kaldirildi.
- Link iliskileri degisti.
- Child table yapisi eklendi veya degisti.
- Naming/permission/is akis davranisi anlamli degisti.

Kayit formati onerisi:
- DocType adi
- Amac
- Ana alanlar
- Link iliskileri
- Child table var/yok
- Durum (active/planned/deprecated)

## 2) Specs Guncelleme Standardi

Asagidaki durumlarda `project/specs/shipyard/` altinda ilgili dosya guncellenir:
- Karar mantigi degisti (Custom Field yerine New DocType veya tersi).
- Modul kapsami/genisligi degisti.
- Multi-tenant prensiplerini etkileyen teknik bir karar alindi.
- Implementasyon standardini etkileyen yeni bir kural benimsendi.

Kural: Memory anlik durum kaydidir, Specs karar ve tasarim gerekcesidir.

## 3) Git Workflow Uygulama Standardi

### Branch
- Gercek yazilim gelistirmesi: `feature/<kisa-konu>`
- Dokumantasyon odakli duzenleme: ihtiyaca gore ayni feature branch veya mevcut gorev branch'i

### Commit Zamani
- Calisan, tutarli, geri alinabilir degisiklik paketi olustugunda commit atilir.
- Yarým veya sadece gecici degisiklikler commit edilmez.

### Merge Zamani
- Feature branch dogrulaninca `develop` branch'ine merge edilir.
- `main` branch'e dogrudan commit/push yapilmaz.

### Analiz ve Sadece Markdown Istisnasi
- Yalnizca analiz yapildiysa commit zorunlu degil.
- Yalnizca markdown uretildiyse commit zorunlu degil.

### Gercek Implementasyon Sonrasi Zorunlu Akis
1. `git add .`
2. `git commit -m "<anlamli mesaj>"`
3. `git push origin feature/<kisa-konu>`
4. `git checkout develop`
5. `git merge feature/<kisa-konu>`
6. `git push origin develop`

## 4) Gorev Sonu Kontrol Listesi

1. Kod/model degisti mi?
2. Memory dosyalari guncellendi mi?
3. Specs gerekirse guncellendi mi?
4. Gercek implementasyon varsa git akisi calistirildi mi?
5. `main` korunuyor mu?