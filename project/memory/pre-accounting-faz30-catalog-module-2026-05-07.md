# Ön Muhasebe Faz 30 - Katalog Modülü - 2026-05-07

## Kapsam
Ürün katalog modülü - tablet ve telefon üzerinden ürün görsellerini ve bilgilerini görerek hızlı sipariş alınabilmesi.

## Modül Özellikleri

### Görsel ve Bilgi Görünümü
- Ürün görseli (ana görsel)
- Ürün adı ve kodu
- Kategori (Item Group)
- Fiyat
- Stok durumu
- Barkod
- Raf numarası
- Koli adedi
- Ambalaj türü
- Marka
- Açıklama

### Ekranlar
1. **Katalog Ana Sayfa** - Grid görünümü, arama, filtreler
2. **Ürün Detay** - Tüm bilgiler, hızlı sepet ekle

## ERPNext Kaynakları
- `Item` - Ürün master
- `Item Image` - Çoklu görsel
- `Item Barcode` - Barkod tablosu
- `Item Group` - Kategori

## Gerekli Custom Fields (Item DocType)

| Alan | Tip | Açıklama |
|------|-----|----------|
| `shelf_location` | Data | Raf numarası |
| `units_per_carton` | Int | Koli adedi |
| `packaging_type` | Select | Ambalaj türü |

## Dosya Yapısı
```
src/features/catalog/
  components/
    CatalogScreen.tsx
    ProductCard.tsx
    ProductDetailSheet.tsx
    BarcodeScanner.tsx
    QuickAddToCart.tsx
  hooks/
    useCatalog.ts
  services/
    catalogService.ts
  types/
    index.ts
```

## Feature Flag
- `catalog.enabled` - Katalog modülü
- `catalog.show_images` - Ürün görselleri
- `catalog.barcode_scanner` - Barkod tarama

## Route
- `/katalog` - Katalog ana sayfa

## Öncelik Sırası
1. Katalog ana ekran (grid + arama)
2. Ürün detay sayfası
3. Hızlı sepet ekleme
4. Barkod tarama

## Doğrulama
- Ürünler grid görünümünde listeleniyor
- Görseller görünüyor
- Arama çalışıyor
- Mobil responsive
- Hızlı sepet çalışıyor