# Stitch Sayfa Promptlari (Kisa)

## Global Prompt
```text
ERPNext/HRMS tabanli tersane SaaS urunu icin Turkce, mobile-first, sade ve hizli bir arayuz tasarla.
Roller: Isci, Formen, Muhendis, Yonetici, Depo Sorumlusu, IK.
Her sayfada: Header, Filter Bar, Summary Cards, Ana Tablo/Kart, Action Bar, Modal/Drawer.
Durumlar: loading, bos, hata, yetki yok.
Rozetler: Taslak, Onayda, Onayli, Reddedildi.
Risk renkleri: Kritik, Yaklasan, Normal, Bilinmiyor.
Tum metinler Turkce olacak; ERP karmasini gizleyen yalin UX olacak.
```

## Sayfa Promptlari

### 1) Genel Bakis (/)
```text
Genel Bakis sayfasi tasarla: aktif gorev, sahadaki personel, kritik stok, bekleyen onay kartlari; hizli aksiyonlar; son aktiviteler, riskli konular ve yaklasan isler panelleri.
```

### 2) Gorevler (/gorevler)
```text
Gorev yonetim sayfasi tasarla: filtreler (durum, oncelik, ekip, tarih), gorev kart/tablo gorunumu, atama/durum degistirme aksiyonlari, gorev detay drawer.
```

### 3) Ekipler (/ekipler)
```text
Ekip yonetim sayfasi tasarla: ekip listesi, kapasite-doluluk, ekip detayinda uye listesi ve acik gorevler, yeni ekip/uye ekle-cikar aksiyonlari.
```

### 4) Saha Bildirimi (/saha-bildirimi)
```text
Saha bildirimi sayfasi tasarla: yeni bildirim formu (kategori, konum, medya, aciliyet), acik-kapali bildirim listesi, durum degistirme ve sorumlu atama.
```

### 5) Zimmet (/zimmet)
```text
Zimmet sayfasi tasarla: personel/ekipman arama, teslim-iade listesi, geciken iade rozetleri, yeni zimmet ve iade al aksiyonlari.
```

### 6) Vardiya Takibi (/attendance)
```text
Vardiya takip sayfasi tasarla: tarih-vardiya filtreleri, present/absent/izinli ozetleri, personel giris-cikis listesi, rol bazli sade gorunum.
```

### 7) Vardiya Plani (/vardiya-plan)
```text
Vardiya planlama sayfasi tasarla: haftalik-aylik takvim, personel bazli atama, cakisma uyarilari, mobilde hizli atama akisi.
```

### 8) Stok (/stok)
```text
Stok operasyon sayfasi tasarla: urun filtreleri, kritik uyari merkezi, hizli material request/transfer/reconciliation aksiyonlari, procurement workflow ve ileri rapor panelleri.
```

### 9) Izin Takibi (/izinler)
```text
Izin takibi sayfasi tasarla: talepler/tahsisler/onay bekleyen sekmeleri, talep kartlari, onay-reddet aksiyonlari, tahsis yok ve cakisma uyarilari.
```

### 10) Mesai (/mesai)
```text
Mesai sayfasi tasarla: tarih/departman/calisan filtreleri, mesai listesi, toplu giris aksiyonu, durum rozetleri (Draft/Open/Pending Approval/Approved).
```

### 11) Mesai Onay (/mesai-onay)
```text
Mesai onay kuyrugu tasarla: coklu secim, toplu onay/reddet, toplam saat-etki ozeti, onay gecmisi paneli.
```

### 12) Alis Faturalari (/alis-faturalari)
```text
Alis faturalari sayfasi tasarla: tedarikci/tarih/odeme durumu filtreleri, fatura listesi, PO-PR baglantili detay drawer.
```

### 13) Personel Liste (/personel)
```text
Personel liste sayfasi tasarla: departman/unvan/durum filtreleri, personel kart-tablosu, yeni personel ve detay aksiyonlari.
```

### 14) Personel Detay (/personel/:id)
```text
Personel detay sayfasi tasarla: kimlik karti, sekmeler (attendance, izin, mesai, maas/bordro, belgeler, zimmet, onboarding), hizli islem butonlari.
```

### 15) Personel Yeni (/personel/yeni)
```text
Yeni personel formu tasarla: adim adim alanlar, zorunlu dogrulama, kaydet/iptal, kayit sonrasi onboarding yonlendirmesi.
```

### 16) Personel Duzenle (/personel/:id/duzenle)
```text
Personel duzenleme sayfasi tasarla: bolumlenmis form, degisiklik ozeti, kaydet/iptal, cakisma uyari alani.
```

### 17) IK Kurulum (/ik-kurulum)
```text
IK kurulum merkezi tasarla: master veri checklist (departman, izin turleri, belge tipleri), tamamlanma yuzdesi ve eksik adim CTA.
```

### 18) Aday Takip (/aday-takip)
```text
Aday takip sayfasi tasarla: kanban pipeline (basvuru-on eleme-gorusme-teklif-ise alim), aday kartlari, asama degistirme.
```

### 19) Ise Giris (/ise-giris-sureci)
```text
Onboarding sayfasi tasarla: asama checklist, evrak/egitim/ekipman adimlari, son tarih ve SLA uyarilari.
```

### 20) Isten Cikis (/isten-cikis-sureci)
```text
Offboarding sayfasi tasarla: zimmet iade, erisim kapatma, kapanis adimlari, kritik eksik adimlarin vurgusu.
```

### 21) Egitim ve Sertifika (/egitim-sertifika)
```text
Egitim-sertifika sayfasi tasarla: atanan egitimler, tamamlanma, sertifika gecerlilik/yenileme uyarilari.
```

### 22) Yetkinlik Matrisi (/yetkinlik-matrisi)
```text
Yetkinlik matrisi sayfasi tasarla: pozisyon x yetkinlik matrisi, seviye gostergeleri, gap analizi ve onerilen egitim aksiyonlari.
```

### 23) Avans ve Masraf (/avans-masraf)
```text
Avans-masraf sayfasi tasarla: talep listesi, durum/tutar/tarih, belge goruntuleme, onay akisi.
```

### 24) Yan Haklar (/yan-haklar)
```text
Yan haklar sayfasi tasarla: prim/ek odeme kayitlari, donemsel toplamlar, onay durumlari, calisan bazli filtreler.
```

### 25) Performans (/performans)
```text
Performans sayfasi tasarla: hedef kartlari, donemsel skorlar, degerlendirme dongusu, yonetici geri bildirim paneli.
```

### 26) IK Raporlari (/ik-raporlari)
```text
IK raporlari sayfasi tasarla: headcount, izin, mesai, bordro, belge uyum KPI; risk panelleri; drill-down tablolar.
```

### 27) Organizasyon Semasi (/organizasyon-semasi)
```text
Organizasyon semasi sayfasi tasarla: hiyerarsi agaci, yonetici-ekip iliskisi, kart popup detaylari.
```

### 28) Uygunluk Takibi (/uygunluk-takibi)
```text
Uygunluk sayfasi tasarla: uyum skoru, eksik/sona eren belgeler, kritik risk listesi ve aksiyon CTA.
```

### 29) Calisan Paneli (/calisan-paneli)
```text
Calisan self-service sayfasi tasarla: profil, izin/masraf/mesai talepleri, belge yukleme, bordro ozeti.
```

### 30) Maas (/maas)
```text
Maas yonetim sayfasi tasarla: calisan bazli maas gorunumu, donem secimi, net-brut degisim gostergeleri.
```

### 31) Bordro Hesapla (/maas-hesapla)
```text
Bordro hesaplama sayfasi tasarla: donem secimi, calisan kapsami, hesapla butonu, toplam maliyet ve hata/uyari ozeti.
```

### 32) Mesai Saat Girisi (/mesai-saat)
```text
Mesai saat girisi sayfasi tasarla: coklu personel in/out grid, toplu kaydet, alt panelde ay sonu maas onizleme etkisi.
```

### 33) Ayarlar (/ayarlar)
```text
Tenant ayarlari sayfasi tasarla: izin turleri, departmanlar, otomatik tahsis, zorunlu belge tipleri, stok/operasyon parametreleri.
```

### 34) Kullanici Yetki (/kullanici-yetki)
```text
Kullanici-rol yonetim sayfasi tasarla: kullanici listesi, rol atama, erisim matrisi, kritik aksiyon onay modali.
```
