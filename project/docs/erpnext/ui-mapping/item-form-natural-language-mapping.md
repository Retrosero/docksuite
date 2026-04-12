# Doğal Dil → Stok Kartı / Item Formu Eşleme

## Örnekler
### "Ürün adı solda dursun"
- UI yerleşim kararı
- mevcut `item_name` alanı kullanılır
- veri modelinde değişiklik gerektirmez

### "Barkod şurada görünsün"
- önce sistemde barkod verisi var mı kontrol et
- sadece görünüm değişiyorsa veri modeli değişmez

### "İkinci barkod da görünsün"
- çoklu barkod ihtiyacı var mı araştır
- önce standart yaklaşım kontrol edilir
- yoksa custom tasarım düşünülür

### "Kritik stok alanı ekle"
- bu bir özellik alanıdır
- Item içine Custom Field adayıdır
