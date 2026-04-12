# Custom Field Workflow Standardi

Bu dokuman, gercek feature implementasyonunda Custom Field acma surecini standartlastirir.

## 1) Karar Kapisi

1. Var olan standard alanlar ihtiyaci karsiliyor mu?
2. Ihtiyac sadece mevcut kaydin ozelligi mi?
3. Tekrarlayan islem/gecmis ihtiyaci var mi?

Sonuc:
- Yalnizca ozellikse: Custom Field
- Gecmis/tekrar/is akisiyla buyuyecekse: New DocType

## 2) Adlandirma ve Dil

- Fieldname: `shipyard_<alan_adi>`
- Format: kucuk harf + snake_case
- Label: Turkce ve son kullanici odakli
- Teknik kisaltmalardan kacinin, acik isim kullanin

## 3) Fieldtype Secim Kurali

- Metin: `Data`
- Kisa aciklama/not: `Small Text`
- Uzun aciklama: `Text Editor`
- Evet/hayir: `Check`
- Liste secimi: `Select`
- Tarih/saat: `Date` veya `Datetime`
- Diger kayit iliskisi: `Link`
- Sayisal deger: `Int` veya `Float`

Kural: Veri dogasina en yakin tip secilir, is kurali UI'da degil veri modelinde korunur.

## 4) Uygulama Yontemi (GUI vs Fixture)

- Gelistirme asamasinda ilk deneme gerekirse `Customize Form` ile hizli prototip yapilabilir.
- Urun ciktisi icin zorunlu adim: custom field tanimini fixture olarak app icine almak.
- Yalnizca GUI'de birakilan alanlar kabul edilmez; tekrar kurulumda kayip riski vardir.

## 5) Multi-Tenant Tekrar Kurulum Prensibi

- Alanlar tum tenantlara kurulabilir urun uzantisidir.
- Tenant ozel degerler kodda sabitlenmez.
- Gerekli tenant farklari config ile yonetilir.
- Yeni siteye kurulumda fixture export/import ile birebir tasinabilirlik korunur.

## 6) Kontrol Listesi (Implementasyon Once)

1. Standard alanlar tekrar kontrol edildi.
2. Custom Field karari net gerekcelendirildi.
3. Fieldname standarda uygun yazildi.
4. Label Turkce yazildi.
5. Fieldtype veri amacina uygun secildi.
6. Fixture plani netlestirildi.
7. Memory guncelleme notu hazirlandi.
8. Feature branch adi belirlendi.