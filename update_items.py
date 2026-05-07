import frappe
import random

frappe.init(site='/home/frappe/frappe-bench/sites/frontend')
frappe.connect()

# Tum aktif urunleri al
all_items = frappe.get_all('Item', filters={'disabled': 0}, pluck='name')
print(f"Toplam urun sayisi: {len(all_items)}")

# Tum warehouse'lari al (varsayilan ilk warehouse kullanilacak)
warehouses = frappe.get_all('Warehouse', pluck='name')
if not warehouses:
    print("Warehouse bulunamadi!")
    warehouses = ['Stores - DS']  # varsayilan
else:
    default_warehouse = warehouses[0]
    print(f"Varsayilan warehouse: {default_warehouse}")

# Fiyat listesi - Standard Selling
price_list = frappe.get_value('Price List', {'name': ['like', '%Selling%'], 'enabled': 1}, 'name')
if not price_list:
    # Price list yoksa olustur
    price_list_doc = frappe.get_doc({
        'doctype': 'Price List',
        'name': 'Standard Selling',
        'currency': 'TRY',
        'enabled': 1,
        'buying': 0,
        'selling': 1,
    })
    try:
        price_list_doc.insert()
        price_list = 'Standard Selling'
        print("Price list olusturuldu: Standard Selling")
    except Exception as e:
        print(f"Price list olusturulamadi: {e}")
        price_list = None

print(f"Price List: {price_list}")

updated_count = 0
created_price_count = 0
created_bin_count = 0

for idx, item_code in enumerate(all_items):
    print(f"[{idx+1}/{len(all_items)}] Isleniyor: {item_code}")
    
    # Rastgele fiyat ve stok olustur (test icin)
    price = round(random.uniform(100, 5000), 2)
    qty = random.randint(0, 200)
    
    # Item tablosunu guncelle
    frappe.db.set_value('Item', item_code, {
        'standard_rate': price,
    })
    print(f"  Item fiyat güncellendi: {price} TRY")
    
    # Item Price kaydi olustur veya guncelle
    if price_list:
        existing_price = frappe.db.get_value('Item Price', 
            {'item_code': item_code, 'price_list': price_list}, 
            'name'
        )
        
        if existing_price:
            frappe.db.set_value('Item Price', existing_price, {
                'price_list_rate': price,
                'currency': 'TRY',
            })
            print(f"  Item Price guncellendi: {price} TRY")
        else:
            price_doc = frappe.get_doc({
                'doctype': 'Item Price',
                'item_code': item_code,
                'price_list': price_list,
                'price_list_rate': price,
                'currency': 'TRY',
                'buying': 0,
                'selling': 1,
                'uom': 'Nos',
            })
            try:
                price_doc.insert()
                created_price_count += 1
                print(f"  Item Price olusturuldu: {price} TRY")
            except Exception as e:
                print(f"  Item Price olusturulamadi: {e}")
    
    # Bin (stok) kaydi olustur veya guncelle
    existing_bin = frappe.db.get_value('Bin', 
        {'item_code': item_code, 'warehouse': default_warehouse}, 
        'name'
    )
    
    if existing_bin:
        frappe.db.set_value('Bin', existing_bin, 'actual_qty', qty)
        print(f"  Bin guncellendi: {qty}")
    else:
        bin_doc = frappe.get_doc({
            'doctype': 'Bin',
            'item_code': item_code,
            'warehouse': default_warehouse,
            'actual_qty': qty,
        })
        try:
            bin_doc.insert()
            created_bin_count += 1
            print(f"  Bin olusturuldu: {qty}")
        except Exception as e:
            print(f"  Bin olusturulamadi: {e}")
    
    updated_count += 1
    
    # Her 10 urunde bir commit et (performans icin)
    if idx % 10 == 0:
        frappe.db.commit()
        print(f"  >> {idx+1} urun islendi, commit yapildi")

# Final commit
frappe.db.commit()

print(f"\n=== TAMAMLANDI ===")
print(f"Toplam islenen: {updated_count}")
print(f"Yeni Item Price: {created_price_count}")
print(f"Yeni Bin kaydi: {created_bin_count}")
