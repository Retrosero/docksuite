# Global Skill — Service Layer

## Amaç
API çağrılarını merkezi, tekrar kullanılabilir ve test edilebilir hale getirmek.

## Kurallar
1. Component içine doğrudan fetch/axios yığma.
2. Her domain için service dosyası oluştur.
3. Request ve response tiplerini ayır.
4. Hata yakalama mantığını merkezi tut.
5. UI katmanına ham response yerine düzenlenmiş veri ver.

## Örnek
- itemService
- attendanceService
- taskService
- materialRequestService
