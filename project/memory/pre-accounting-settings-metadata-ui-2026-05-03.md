# Ön Muhasebe Ayar Metadata UI - 2026-05-03

## Yapılan
- Ayar ekranındaki sabit liste merkezi `FEATURE_SETTING_DEFINITIONS` şemasına taşındı.
- Her ayar için grup, tenant kapsamı, plan kapsamı, yönetici rolleri ve mobil etki açıklaması tanımlandı.
- Ayarlar ekranı grup bazlı mobil uyumlu bölümlere ayrıldı.
- Ayar metadata listesi ile varsayılan ayar anahtarlarının birebir hizalı kaldığını doğrulayan testler eklendi.

## Teknik Karar
- Component içinde ayar açıklaması hardcode edilmedi.
- Plan bazlı gerçek kilitleme henüz uygulanmadı; bu fazda plan kapsamı görünür metadata olarak hazırlandı.
- React Native'e taşınabilirlik için ayar sözleşmesi UI dışındaki config katmanında tutuldu.

## Sonraki Adım
- Tenant plan bilgisi backend'den geldiğinde `planScope` üzerinden ayar kilitleme ve açıklama davranışı eklenebilir.
