# Shipyard Portal Frontend

Bu klasor, tersane operasyonlari icin ERPNext'ten ayrik calisan `shipyard-portal` frontend temelini tutar.

## Hedef
- mobil oncelikli operasyon arayuzu
- Turkce ve sade ekran dili
- tenant-safe config yapisi
- component-first klasorleme
- ERPNext core'a dokunmadan REST tabanli entegrasyon

## Bu adimda kurulan yapi
- Vite + React + TypeScript iskeleti
- feature-based klasor yapisi
- tenant config katmani
- mock service verisiyle acilan baslangic dashboard'u

## Baslangic komutlari
1. `npm install`
2. `npm run dev`
3. `npm run build`

## ERPNext API baglantisi (dev)
- Vite dev server, `/api` isteklerini ERPNext'e proxy eder.
- Varsayilan proxy hedefi: `http://127.0.0.1:8000`
- Farkli hedef gerekiyorsa `.env.local` icine su degiskenleri eklenir:
  - `VITE_ERP_PROXY_TARGET=http://127.0.0.1:8000`
  - `VITE_ERP_API_BASE_URL=/api`

## Ilk ekran kapsamı
- operasyon ozeti
- bugunku vardiya karti
- gorev/ekip/saha bildirimi/zimmet hizli erisimlari

## Sonraki dogal adimlar
1. auth ve tenant bootstrap akisi
2. ERPNext REST istemcisi
3. gorev listesi ve saha bildirimi feature'lari
