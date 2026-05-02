# On Muhasebe Faz 2 - Tahsilat Tutar Otomatik Doldurma ve Ust Limit Validasyonu (2026-05-02)

## Kapsam
Tahsilat ekraninda secilen acik faturanin kalan borcunu otomatik tahsilat tutarina yazma ve borc ustu girisi engelleme eklendi.

## Yapilanlar
- `CollectionScreen` guncellendi:
  - secilen faturadan `outstanding_amount` hesaplandi
  - fatura secildiginde `paidAmount` otomatik olarak kalan borcla dolduruldu
  - form kaydinda `paidAmount > outstanding_amount` kontrolu eklendi
  - kalan borc bilgisi ekranda gosterildi
  - borc asimi durumunda anlik hata mesaji gosterildi

## Dogrulama
- `npm run build` basarili.

## Sonraki Adim
Kismi tahsilat senaryosu icin tahsilat tutari degistirildiginde `allocated_amount` hesap mantigini ve kalan borc sonrasi durum etiketini zenginlestirmek.
