# Ön Muhasebe Faz 15 - Rapor CSV Export

## Amaç
Raporlar ekranındaki temel ön muhasebe özetlerini tenant kontrollü şekilde CSV olarak indirilebilir hale getirmek.

## Kapsam
- Satış, alış, tahsilat, ödeme ve net bakiye özetlerinden CSV satırları üretme.
- Raporlar ekranında `CSV İndir` aksiyonu.
- Export görünürlüğünü ayar anahtarına bağlama.

## ERPNext Kaynakları
- `Sales Invoice`
- `Purchase Invoice`
- `Payment Entry`
- `GL Entry`

## Ayar Anahtarı
- key: `reports.enable_csv_export`
- grup: Raporlar
- varsayılan: `true`
- kapsam: tenant
- plan: `ticari`, `mobil`
- frontend davranışı: Kapalıysa CSV indirme butonu render edilmez.
- backend kontrolü: Bu fazda mevcut rapor okuma servisleri kullanılır.
- mobil etkisi: Raporlar ekranında indirme aksiyonu üst araç çubuğunda görünür.

## Kabul Kriterleri
- Component içinde doğrudan ERP API çağrısı yoktur.
- CSV üretimi test edilebilir service helper olarak kalır.
- Unit ve Playwright smoke kapsamı vardır.
- Test, e2e ve build başarılıdır.
