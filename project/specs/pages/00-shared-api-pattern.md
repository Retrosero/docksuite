# Ortak API Deseni

Frappe/ERPNext resource API yaklaşımı:

## Listeleme
GET /api/resource/{DocType}

## Tek kayıt
GET /api/resource/{DocType}/{name}

## Oluşturma
POST /api/resource/{DocType}

## Güncelleme
PUT veya PATCH /api/resource/{DocType}/{name}

## Sayfalama
- limit_page_length
- limit_start

## Filtreleme
- filters parametresi

## Not
Önce standart resource API kullanılmalı.
Gereksiz yere özel endpoint yazılmamalıdır.
