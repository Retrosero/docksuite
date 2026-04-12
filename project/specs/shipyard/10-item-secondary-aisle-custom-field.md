# Item Secondary Aisle Custom Field

## Karar
- Hedef DocType: `Item`
- Fieldname: `shipyard_secondary_aisle`
- Label: `2. Reyon`
- Fieldtype: `Data`

## Neden Custom Field?
- Bu ihtiyaç `Item` kaydına ait tekil bir özellik bilgisidir.
- Tekrarlayan işlem/geçmiş tutma ihtiyacı yoktur.
- Bu nedenle yeni DocType yerine Custom Field doğru çözümdür.

## SaaS / Multi-Tenant Notu
- Alan tenant-safe olacak şekilde genel ürün uzantısı olarak tanımlandı.
- Her tenant site kurulumunda fixture üzerinden tekrar uygulanabilir.
- Firma özel sabit süreç veya müşteri adı kod içine gömülmedi.

## Yerleşim Notu
- Alan, `Item` formunda genel ürün bilgilerine yakın olacak şekilde `item_group` sonrasına konumlandırıldı.
