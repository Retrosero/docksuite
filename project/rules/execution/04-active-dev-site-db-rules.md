# Execution Rules - Active Dev Site/DB

## Local development default
Bu repository'de lokal frontend + API testlerinde varsayilan tenant/site:
- `frontend`

Varsayilan veritabani:
- `_cc183800ce8729fe`

## Zorunlu uygulama
1. `shipyard-portal` uzerinden gelen isteklerde site adi `frontend` olacak sekilde header/config gonder.
2. Lokal smoke test ve veri seed islemlerinde varsayilan olarak `frontend` site'i kullan.
3. Baska site uzerinde islem gerekiyorsa komutta/site seciminde acikca belirtilmelidir.
4. Multi-tenant urun kurallari korunur; bu kural yalnizca lokal calisma varsayimini sabitler.
