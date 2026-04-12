# Global Skill - Component Design

## Amaç
Yeni ekranları component-first mantıkla tasarlamak.

## Adımlar
1. Ekranın amacını belirle
2. Sayfayı bölümlere ayır
3. Tekrar eden alanları belirle
4. Shared component ve feature component ayrımı yap
5. Props yapısını sade tut
6. UI ve business logic ayrımını koru
7. Flowbite MIT component uyumu varsa önce onu kontrol et
8. Flowbite ile karşılanamayan kısımlarda ince wrapper veya custom component kararını ver

## SaaS ek kontrolü
- Bu component tenant'tan bağımsız reusable mı?
- Tenant farklılığı config ile yönetilebilir mi?

## Flowbite notu
- Tasarım kararında Flowbite MIT alanları kullanılabiliyorsa custom UI üretimini geciktir.
- Lisans dışı Flowbite varlıkları bu skill kapsamında kullanılmaz.

## Çıktı
- page component
- feature component'ler
- shared ui bileşenleri
- types
- service/hook listesi
