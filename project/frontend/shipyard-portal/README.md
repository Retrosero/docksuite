# Shipyard Portal Frontend

Bu klasor, tersane kullanicilari icin sade frontend katmanidir.

## Hedef kullanicilar
- isci
- formen
- muhendis
- yonetici

## Ilk ekran adaylari
- giris sonrasi dashboard
- gorevlerim
- vardiya giris/cikis
- malzeme talep
- saha bildirimi
- zimmet teslim

## MCP UI calisma notu
- MCP tabanli arayuz denemeleri ayrik bir workspace icinde tutulur.
- Tavsiye edilen kaynak proje: `themesberg/mcp-ui-starter`
- Kullanilan UI seti: Flowbite'nin MIT lisansli acik kaynak bilesenleri
- ERPNext baglantisi dogrudan core degisimi ile degil, REST API ile kurulur.

### Beklenen lokal akis
1. `git clone https://github.com/themesberg/mcp-ui-starter.git`
2. `npm install`
3. `npm run dev --use-forwarded-host`
4. `http://localhost:3000/mcp` endpoint'ini MCP istemcisine bagla

### Dis erisim gerekiyorsa
- Ayrik test ortaminda tunnel kullanilir
- Tenant verisi UI icine kopyalanmaz
- Lisans disi Flowbite varliklari kullanilmaz
