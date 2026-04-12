# Shipyard Rules — Multi-Tenant SaaS

## Temel yaklaşım
1. Her müşteri ayrı site ve ayrı veritabanı ile çalışır.
2. Kod tabanı ortaktır.
3. Custom app'ler tenant-safe olmalıdır.
4. Yeni modüller tüm müşterilerde tekrar kurulabilir tasarlanmalıdır.
5. Firma özel davranış gerekiyorsa mümkünse ayar / config yaklaşımı tercih edilmelidir.

## Geliştirme kuralları
1. Tek bir firma adı, süreç adı veya sabitini kod içine gömme.
2. Sabit müşteri varsayımlarıyla DocType tasarlama.
3. Tenant bazlı branding iş mantığından ayrılmalı.
4. Site izolasyonunu bozacak ortak veri depolama çözümü üretme.
5. Fixtures ve app içi yapı yeni site kurulumlarında tekrar kurulabilir olmalı.
