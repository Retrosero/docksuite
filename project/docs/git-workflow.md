# Git Workflow

Bu repo icin ilk faz branch modeli:

- `main`: canliya cikabilecek stabil kod.
- `develop`: gunluk gelistirme toplama alani.
- `feature/*`: yeni ozellik calisma branchleri.
- `fix/*`: gelistirme surecinde hata duzeltme branchleri (opsiyonel).

Ileri fazda aktif edilecek branchler:

- `release/vX.Y.Z`: yayin oncesi son toplama, test ve notlar.
- `hotfix/*`: canli sistem acil duzeltmeleri (`main` tabanli).

## Merge Kurallari

- Gunluk akis: `feature/* -> develop`
- Yayin akisi: `develop -> main`
- `main` branch'e dogrudan commit yapilmaz; merge/PR ile girilir.

## Feature Backlog Baslangici

- `feature/erpnext-bootstrap`
- `feature/shipyard-domain-model`
- `feature/shipyard-doctypes-phase1`
- `feature/shipyard-frontend-foundation`

## Commit Sozlugu

- `chore:` altyapi, klasor, ayar
- `docs:` dokumantasyon
- `feat:` yeni ozellik
- `fix:` hata duzeltme
- `refactor:` yapisal iyilestirme
- `test:` test ekleme/guncelleme

## Tag / Surumleme

- MVP'den itibaren semantic tag kullan: `v0.1.0`, `v0.2.0`, `v1.0.0`
- Ornek:
  - `git tag v0.1.0`
  - `git push origin v0.1.0`
