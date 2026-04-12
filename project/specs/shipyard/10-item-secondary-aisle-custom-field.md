# Item Secondary Aisle Custom Field

## Karar
- Hedef DocType: `Item`
- Fieldname: `shipyard_secondary_aisle`
- Label: `2. Reyon`
- Fieldtype: `Data`

## Neden Custom Field?
- Bu ihtiyaÃ§ `Item` kaydÄ±na ait tekil bir Ã¶zellik bilgisidir.
- Tekrarlayan iÅŸlem/geÃ§miÅŸ tutma ihtiyacÄ± yoktur.
- Bu nedenle yeni DocType yerine Custom Field doÄŸru Ã§Ã¶zÃ¼mdÃ¼r.

## SaaS / Multi-Tenant Notu
- Alan tenant-safe olacak ÅŸekilde genel Ã¼rÃ¼n uzantÄ±sÄ± olarak tanÄ±mlandÄ±.
- Her tenant site kurulumunda fixture Ã¼zerinden tekrar uygulanabilir.
- Firma Ã¶zel sabit sÃ¼reÃ§ veya mÃ¼ÅŸteri adÄ± kod iÃ§ine gÃ¶mÃ¼lmedi.

## YerleÅŸim Notu
- Alan, `Item` formunda genel Ã¼rÃ¼n bilgilerine yakÄ±n olacak ÅŸekilde `item_group` sonrasÄ±na konumlandÄ±rÄ±ldÄ±.

## Uygulama Doğrulaması (2026-04-12)
- Site: `shipyard.localhost`
- `shipyard_app` kurulu olduğu doğrulandı.
- Gerçek app yolu altında `hooks.py` içine fixtures tanımı ve `fixtures/custom_field.json` eklendi.
- `bench --site shipyard.localhost migrate` ve `bench --site shipyard.localhost clear-cache` başarılı çalıştı.
- Doğrulama sonucu:
  - Custom Field kaydı mevcut: `Item-shipyard_secondary_aisle`
  - `tabItem` kolonu mevcut: `shipyard_secondary_aisle`
  - Field meta doğrulaması: `label=2. Reyon`, `fieldname=shipyard_secondary_aisle`, `fieldtype=Data`, `read_only=0`, `hidden=0`
  - Alan düzenlenebilir durumda.
