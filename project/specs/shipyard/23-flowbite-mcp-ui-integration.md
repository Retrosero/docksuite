# Flowbite MCP UI Integration

## Amaç
Flowbite'nin MIT lisansli acik UI alanlarini, ERPNext core'a dokunmadan, ayrik bir MCP UI starter uzerinden kullanmak.

## Karar
- Bu entegrasyon yeni bir ERPNext feature'i degil, ayrik bir frontend/MCP calisma alanidir.
- Kaynak proje: `themesberg/mcp-ui-starter`
- Kullanilacak UI parcalari: Flowbite'nin MIT kapsamindaki acik kaynak bilesenleri
- ERPNext ile baglanti noktasi: REST API / mevcut standard resource pattern

## Kapsam
- Ayri bir UI starter repo/klasor kullanilir.
- MCP server, calisan frontend uygulamasinin parcasidir.
- ERPNext tarafinda core degisimi yapilmaz.
- Tenant'a ozel sabit degerler UI icine gomulmez.

## Sinirlar
- Flowbite Pro, ozel bloklar veya lisans disi varliklar otomatik olarak kullanilmaz.
- UI starter icine domain verisi ikinci kez kopyalanmaz.
- Her tenant icin ayri site/veritabani kuralina dokunulmaz.

## Uygulama Yaklasimi
1. `mcp-ui-starter` ayrik bir workspace olarak clone edilir.
2. Flowbite'nin MIT alanlari bu workspace icinde kullanilir.
3. UI katmani ERPNext'e sadece API ile baglanir.
4. Lokal testte `/mcp` endpoint'i calistirilir.
5. Gerekirse tunnel ile dis MCP istemcisine acilir.

## Faz 2 ile Iliski
Bu is, Faz 2'nin "ERPNext UI yonetilebilirlik kontrolu" adimindan once bir UI deneme alanidir.
Amaç, ERPNext UI degisikligi yapmadan once Flowbite tabanli MCP akisini degerlendirmektir.

## Sonraki Adim
- Ayrik `shipyard-portal` dokumanina MCP calisma akisi eklenir.
- Faz 2 checklist'ine bu entegrasyonun kullanilabilirlik kontrolu notu eklenir.
