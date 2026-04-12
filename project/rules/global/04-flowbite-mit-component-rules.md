# Global Rules - Flowbite MIT Component Usage

## Temel ilke
Tasarim yaparken once Flowbite'nin MIT kapsamindaki acik kaynak component'leri kontrol edilir.

## Kurallar
1. Uygun Flowbite MIT component varsa once o kullanilir.
2. Flowbite Pro, ozel bloklar veya lisans disi varliklar kullanilmaz.
3. Flowbite component'i dogrudan yeterliyse yeni UI icat edilmez.
4. Uygulama ihtiyaci Flowbite ile karsilanmiyorsa, mevcut component uzerine ince bir wrapper yazilir.
5. Domain mantigi Flowbite class veya markup'ina gomulmez.
6. Flowbite tabanli component'ler shared katmanda reusable tutulur.
7. Tenant farkliliklari component icinde sabitlenmez; config veya theme token ile beslenir.
8. Mobil-first ve Turkce arayuz kurali Flowbite kullaniminda da aynen gecerlidir.
9. Bir ekranin Flowbite ile karsilanan parcasi varsa, ayni tasarim icin ikinci bir custom varyant uretilmez.
10. Tasarim kararinda kullanilan Flowbite component'i ve gerekiyorsa wrapper nedeni kisa not edilir.

