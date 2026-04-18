# IK Maas ve Mesai Giris Spec

## Hedef
- IK kullanicisinin personel bazli aylik temel maas kaydi ekleyebilmesi/guncelleyebilmesi
- Formen/yonetici veya calisanin rolune gore mesai kaydi acabilmesi
- Bordro hesaplama ekraninin ayni maas verisini tekrar kullanmasi

## Veri Kaynaklari
- `Employee.shipyard_monthly_base_salary`
- `Employee.salary_currency`
- `Overtime Request`
- `Attendance`

## Maas Akisi
1. Aktif personel listesi `Employee` kaynagindan cekilir.
2. Secilen personel icin maas bilgisi once `Salary Structure Assignment`, yoksa `Employee.shipyard_monthly_base_salary` fallback'i ile okunur.
3. IK ekrani temel maasi `Employee` kaydina yazar.
4. Bordro ekraninda ayni veri `fetchSalaryInfo` uzerinden yeniden kullanilir.

## Mesai Akisi
1. Mesai ekrani rol bazli actor access bilgisini okur.
2. Calisan gorunumunde sadece kendi `Overtime Request` kayitlari listelenir.
3. `Yeni Mesai` aksiyonu `Overtime Request` kaydini `Open` statusu ile olusturur.

## Test Kapsami
- `salaryService.spec.ts`
  - Salary Structure Assignment okuma
  - Employee custom field fallback'i
  - Maas guncelleme request payload'i
- `overtimeService.spec.ts`
  - Calisan gorunumunde veri izolasyonu
  - Mesai create request payload'i
- `payrollService.spec.ts`
  - Mesai carpani ve net maas hesaplama
  - Verisiz durumda sifir deger donusu
