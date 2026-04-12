# AGENTS.md

## Proje Tanımı

Bu proje, ERPNext ve HRMS altyapısını kullanan, tersane operasyonlarını yönetmek için geliştirilmiş çok kullanıcılı ve çok firmaya satılabilir (multi-tenant SaaS) bir sistemdir.

Amaç:

* ERPNext çekirdeğini koruyarak
* tersane süreçlerini sadeleştiren
* mobil uyumlu ve Türkçe arayüzlü
* tekrar kurulabilir bir ürün geliştirmek

---

## Zorunlu Okuma

Her işlemden önce mutlaka aşağıdaki klasörleri oku:

* project/rules/
* project/skills/
* project/docs/erpnext/
* project/memory/

Kural:
→ Bu klasörleri okumadan implementasyona başlama

---

## Çalışma Davranışı (Otonom Mod)

Bu projede mümkün olduğunca kullanıcıdan onay istemeden ilerle.

Kurallar:

* Gereksiz doğrulama soruları sorma
* Belirsizlik varsa makul varsayım yap ve devam et
* Küçük kararlar için kullanıcıyı bekletme
* İşleri mümkün olduğunca uçtan uca tamamla
* Her adımda durup onay isteme

Sadece şu durumlarda dur ve sor:

* Yıkıcı işlem varsa (silme, resetleme)
* Geri alınamaz işlem varsa
* Production etkileniyorsa
* Gizli bilgi gerekiyorsa
* Workspace dışına çıkılıyorsa
* Kritik network erişimi gerekiyorsa

Bunun dışındaki durumlarda:
→ ilerle
→ sonucu raporla

---

## Çalışma Stratejisi

Her görevde şu sırayı takip et:

1. Mevcut klasör ve dosyaları analiz et
2. rules/ klasörünü oku
3. ilgili skills dosyalarını oku
4. plan oluştur
5. küçük parçalara böl
6. implement et
7. kısa teknik özet bırak

Kurallar:

* Aynı işi yapan ikinci yapı oluşturma
* Mevcut kodu okumadan yeni yapı yazma
* Tekrarlayan kod üretme
* Minimum değişiklikle ilerle

---

## SaaS ve Multi-Tenant Kuralları

Bu proje çok firmaya satılacak SaaS üründür.

Kurallar:

* Tek firmaya özel kod yazma
* Firma adı, sabit değer, özel süreç kod içine gömülmez
* Tüm yapılar tekrar kullanılabilir olmalıdır
* Tenant farklılıkları config ile çözülmelidir
* Veri izolasyonu bozulmaz
* Her müşteri ayrı site/veritabanı kullanır
* Kod tabanı ortaktır

---

## ERPNext Entegrasyon Kuralları

* ERPNext core değiştirilmez
* Frappe HR çekirdeği korunur
* Tüm geliştirmeler custom app içinde yapılır:

  * core_app
  * shipyard_app
* Veri tek kaynak olarak ERPNext içinde tutulur
* Aynı veri ikinci yerde tutulmaz

Karar mantığı:

* özellik → Custom Field
* tekrar eden işlem → New DocType
* standart yeterliyse → yeni yapı açma

---

## Component First Geliştirme

Kurallar:

* Büyük sayfalar tek parça yazılmaz
* Her ekran component’lere bölünür
* UI ve business logic ayrılır
* API çağrıları component içine gömülmez
* Tekrar eden yapılar reusable yapılır

---

## Frontend Kuralları

* Tüm arayüzler Türkçe olacak
* Tüm arayüzler %100 mobil uyumlu olacak
* Mobile-first yaklaşım kullanılacak
* Kullanıcı ERP karmaşıklığını görmemeli
* Ekranlar sade ve hızlı olmalı

---

## Shipyard Domain Kuralları

İlk odak modüller:

* görev yönetimi
* ekip / atama
* vardiya / attendance
* malzeme talep
* zimmet
* saha bildirim
* teknik doküman

Hedef kullanıcılar:

* işçi
* formen
* mühendis
* yönetici
* depo sorumlusu
* İK

---

## Git Workflow Kuralları

Branch yapısı:

* main → production
* develop → entegrasyon
* feature/* → geliştirme

Kurallar:

* main'e direkt commit yok
* her iş feature branch’te yapılır
* feature → develop → main akışı kullanılır
* commit mesajları anlamlı olmalıdır

---

## Onay Politikası

Varsayılan davranış:
→ durma, ilerle

İstisna:
→ risk varsa sor

Ama:

* gereksiz soru sorma
* kullanıcıyı bloklama
* işi yarım bırakma

---

## Beklenen Çıktı Formatı

Her işlem sonunda:

* yapılan işlemler
* değiştirilen dosyalar
* teknik özet
* sonraki adım önerisi

yazılmalıdır.

---

## Son Kural

Bu proje:

* AI ile geliştiriliyor
* modüler ilerliyor
* SaaS olarak büyütülecek

Bu yüzden:

→ hızlı değil doğru ilerle
→ kısa değil sürdürülebilir çözüm üret
→ tek seferlik değil tekrar kullanılabilir yapı kur

## Git Workflow (Zorunlu)

Bu projede yapılan HER değişiklik sonrası aşağıdaki git akışı uygulanır.

### Branch Kuralları

* main → production (direkt commit yasak)
* develop → entegrasyon
* feature/* → geliştirme

---

### Çalışma Akışı

Her görevde:

1. Eğer yeni işse:

   * yeni feature branch oluştur

2. Değişiklikleri tamamladıktan sonra:

   * git add .
   * git commit -m "anlamlı açıklama"

3. Feature branch’i remote’a gönder:

   * git push origin feature/xxx

4. Ardından develop branch’e merge et:

   * git checkout develop
   * git merge feature/xxx
   * git push origin develop

---

### Kurallar

* main branch’e direkt commit YASAK
* her iş ayrı feature branch’te yapılır
* commit mesajları açıklayıcı olmalıdır
* yarım iş commit edilmez
* her görev sonunda git işlemi zorunludur

---

### Otonom Davranış

* Kullanıcı git demese bile bu işlemleri uygula
* Yeni feature branch ismi görev içeriğine göre otomatik oluştur
* Commit mesajını yapılan işe göre otomatik üret
* Git işlemini görev tamamlandıktan sonra kendin başlat

---

### İstisnalar

Aşağıdaki durumlarda git işlemi yapılmaz:

* sadece analiz yapıldıysa
* sadece markdown üretildiyse
* kullanıcı açıkça "commit yapma" dediyse

---

### Amaç

* düzenli commit geçmişi
* güvenli geliştirme süreci
* SaaS projesine uygun versiyonlama
* geri alınabilir değişiklikler
