# HR Spec 05 - Employee Zimmet Entry Flow

## Goal
- Personel detay ekranindan calisana ait zimmet kayitlarini listelemek.
- Yeni zimmet kaydi eklemek.
- Var olan zimmet kaydini silmek.
- ERPNext core degistirmeden, mevcut `Zimmet` DocType uzerinden ilerlemek.

## Scope
- Backend: `shipyard_app.personnel_api`
- Frontend: `shipyard-portal` personel detay ekrani
- Data source: `Zimmet` DocType

## Backend API Contract

### `list_employee_zimmet_records(employee_id)`
- Input:
  - `employee_id` (required)
- Output:
  - `items[]`: `name`, `employee`, `item`, `item_name`, `quantity`, `delivery_date`, `return_date`, `return_status`, `delivered_by`, `note`, `modified`

### `upsert_employee_zimmet_record(record_id=None, payload=None, **kwargs)`
- Input:
  - `employee`, `item`, `quantity`, `delivery_date` required
  - `return_date`, `return_status`, `delivered_by`, `note` optional
  - `record_id` varsa update, yoksa create
- Output:
  - `{ created, updated, name }`

### `delete_employee_zimmet_record(record_id)`
- Input:
  - `record_id` (required)
- Output:
  - `{ deleted, name }`

## Frontend Flow
- Personel detayinda yeni "Zimmet" karti:
  - Ozet: toplam kayit, acik zimmet, tam iade
  - Son zimmet listesi (maksimum 6 kayit)
  - "Kaydi Sil" aksiyonu
  - "Yeni zimmet kaydi" formu

## UI/UX Notes (Mobile-first)
- Kart yapisi personel detayindaki mevcut belge kart dili ile ayni tutulur.
- Form 1 kolon mobil, 2 kolon desktop davranisi ile responsive olur.
- Durum metinleri ve islemler Turkce ve sade kalir.

## Validation Rules
- `item` bos olamaz
- `quantity > 0` olmalidir
- `delivery_date` zorunludur
- Silme islemi kullanici onayi ile calisir

## Multi-tenant / SaaS Constraints
- Tenant'a ozel sabit deger kodlanmaz.
- Dogrudan ERPNext `Zimmet` verisi kullanilir, duplicate veri tutulmaz.
- Tum logic custom app ve frontend katmaninda kalir.
