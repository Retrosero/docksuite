# Ön Muhasebe Faz 27 - SaaS Operasyon Katmanı - 2026-05-05

## Kapsam
Lisans/abonelik yönetimi, tenant sağlık kontrolleri ve diagnostic araçları.

## Teknik Not
- Plan tanımları: Starter, Pro, Enterprise
- Kullanım limitleri: kullanıcı sayısı, işlem limiti, depolama
- Tenant health-check: veritabanı bağlantısı, API yanıt süreleri
- Diagnostic araçları: log görüntüleme, performans metrikleri

## Plan Tanımları
| Plan | Kullanıcı | İşlem/Ay | Depolama |
|------|-----------|-----------|----------|
| Starter | 5 | 1.000 | 1 GB |
| Pro | 25 | 10.000 | 10 GB |
| Enterprise | Sınırsız | Sınırsız | Sınırsız |

## Health Check Metrikleri
- Veritabanı yanıt süresi
- API endpoint yanıt süresi
- Disk kullanımı
- Bellek kullanımı

## Doğrulama
- `npm run -s build`
- Health check API testi
