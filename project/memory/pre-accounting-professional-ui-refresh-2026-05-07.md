# Ön Muhasebe Professional UI Refresh - 2026-05-07

## Kapsam
- Ön muhasebe portalının ortak görsel dili kurumsal SaaS görünümüne yaklaştırıldı.
- Değişiklikler ERPNext veri modeli veya backend akışlarına dokunmadan frontend ortak katmanında yapıldı.

## Yapılanlar
- `src/styles/global.css` içine profesyonel tasarım token override katmanı eklendi.
- Renk paleti koyu deniz mavisi, teal aksiyon rengi, nötr gri yüzeyler ve semantik durum renkleriyle güncellendi.
- Buton, form, tablo, kart, panel, sidebar, header ve mobil alt menü stilleri ortak seviyede iyileştirildi.
- App shell ve route etiketlerinde görünen Türkçe karakterler düzeltildi.
- Route spec güncel route omurgasıyla hizalandı.
- Rapor servisindeki TypeScript unused değişken uyarıları giderildi.

## Doğrulama
- `npm test -- --run`
- `npm run -s build`

## Not
- Tenant'a özel marka değeri eklenmedi.
- Renkler ortak ürün standardı olarak frontend token katmanında tutuldu.
