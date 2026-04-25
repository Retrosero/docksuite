# HR Setup Center (2026-04-25)

## Scope
- IK urun gap analizi sonrasi ilk uygulama adimi olarak `IK Kurulum Merkezi` baslatildi.
- Route: `/ik-kurulum`
- Frontend feature: `src/features/hr-setup`

## Implemented
- Master spec eklendi:
  - `project/specs/hr/00-hr-product-gap-and-page-design-spec.md`
  - `project/specs/hr/01-hr-setup-center-page-spec.md`
- Standart ERPNext/HRMS resource API kaynaklari ile IK master veri okuma eklendi:
  - Company
  - Branch
  - Department
  - Designation
  - Employment Type
  - Employee Grade
  - Employee Group
  - Leave Type
  - Holiday List
  - Shift Type
  - Payroll Period
  - Employee
- Veri kalite uyarilari UI tarafinda hesaplanir:
  - departmansiz personel
  - unvansiz personel
  - istihdam turu eksigi
  - izin/vardiya/bordro/master veri eksikleri
- Basit master veri icin hizli ekleme formu eklendi:
  - Branch
  - Department
  - Designation
  - Employment Type
  - Employee Grade
  - Employee Group
  - Leave Type

## Frontend Notes
- Mobile-first kart, accordion, alert ve form yapisi kullanildi.
- Route `Yonetim` menu grubuna eklendi.
- UI metinleri Turkce tutuldu.
- Business logic component icine gomulmedi; service/hook katmanina ayrildi.

## Additional Fix
- `salaryService.fetchSalaryInfo` icinde Salary Structure Assignment sorgusuna `employee_name` alani eklendi.
- Testte beklenen personel adi artik assignment satirindan dogru mapleniyor.

## Verification
- `npm run build` basarili.
- `npm test` basarili: 4 test dosyasi, 19 test.

## Next Step
- `Ozluk Dosyasi` icin `Employee Document Record` model/spec kararini netlestir.
- Ardindan personel detay ekranina belge durumu ve eksik belge uyarilarini ekle.

