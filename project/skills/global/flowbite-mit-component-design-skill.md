# Global Skill - Flowbite MIT Component Design

## Amac
Yeni ekran ve component'leri tasarlarken Flowbite'nin MIT lisansli acik kaynak component havuzunu referans almak ve gereksiz custom UI uretimini azaltmak.

## Ne zaman kullanilir
- Yeni ekran tasarlarken
- Mevcut ekran refactor edilirken
- Component secimi yapilirken
- Flowbite tabanli bir UI standardi korunmak istendiginde

## Ilgili karar dokumani
- `project/docs/erpnext/decisions/04-flowbite-component-selection.md`

## Adimlar
1. Ekranin ihtiyacini ve gerekli UI parcalarini listele.
2. Flowbite MIT component envanterinde eslesme ara.
3. Karar ver:
   - dogrudan kullan
   - wrapper ile kullan
   - compose et
   - custom component yaz
4. Dogrudan kullanilacaksa mevcut davranisi degistirmeden ilerle.
5. Wrapper gerekiyorsa yalnizca proje standardi, theme ve data baglantisini ekle.
6. Business logic'i Flowbite component'in icine gomme.
7. Tenant ozel gorunumleri config veya token ile ayristir.
8. Mobil, Turkce ve reusable olma kosullarini kontrol et.

## Karar kurallari
- Flowbite MIT component yeterliyse custom component yazma.
- Flowbite component eksikse once mevcut component'i saran ince bir adapter yaz.
- Pro / lisans disi Flowbite varliklari tasarim surecine sokma.
- Tekrar eden UI parcalari shared component'e donusturulur.

## Cikti
- secilen Flowbite component'ler
- kullanilan wrapper/component isimleri
- custom yazilan kisimlar
- lisans / tenant / theme notlari

