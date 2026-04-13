# Alış Faturaları Sayfası Spec

## Amaç
Satın alma / muhasebe tarafı için alış faturalarını sade, filtrelenebilir ve akışa uygun göstermek.

## ERPNext karşılığı
- Purchase Invoice
- Purchase Order
- Purchase Receipt
- Supplier

## Temel alanlar
- supplier
- posting_date
- due_date
- grand_total
- outstanding_amount
- status
- company

## Önerilen API kullanımı
GET /api/resource/Purchase Invoice?fields=["name","supplier","posting_date","due_date","grand_total","outstanding_amount","status","company"]&limit_page_length=20
GET /api/resource/Purchase Invoice/{name}

## UI notları
- muhasebe ekranları sadeleştirilebilir
- ancak satın alma/fatura çekirdeği ERPNext'te kalır
- kalem detayları ayrı panelde gösterilebilir
