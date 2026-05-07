import frappe

frappe.init(site='docksuite.local')
frappe.connect()

# Tum mevcut urunleri guncelle
items_data = [
    {'item_code': 'DEMO-GEMI-001', 'standard_rate': 5000, 'total_qty': 0, 'stock_uom': 'Saat'},
    {'item_code': 'DEMO-MALZ-001', 'standard_rate': 250, 'total_qty': 100, 'stock_uom': 'Kilogram'},
    {'item_code': 'DEMO-MALZ-002', 'standard_rate': 150, 'total_qty': 50, 'stock_uom': 'Adet'},
    {'item_code': 'DEMO-HIZ-001', 'standard_rate': 3000, 'total_qty': 0, 'stock_uom': 'Adet'},
]

for data in items_data:
    item_code = data['item_code']
    if frappe.db.exists('Item', item_code):
        # Item tablosunu guncelle
        frappe.db.set_value('Item', item_code, {
            'standard_rate': data['standard_rate'],
            'stock_uom': data['stock_uom'],
        })
        print(f"Item güncellendi: {item_code}")
        
        # Stok icin Bin kaydi olustur
        if data['total_qty'] > 0:
            # Tum warehouse'lari al
            warehouses = frappe.get_all('Warehouse', pluck='name')
            for warehouse in warehouses:
                # Bin kaydi var mi kontrol et
                existing_bin = frappe.db.get_value('Bin', 
                    {'item_code': item_code, 'warehouse': warehouse}, 
                    'name'
                )
                
                if existing_bin:
                    # Guncel qty'yi ayarla
                    frappe.db.set_value('Bin', existing_bin, 'actual_qty', data['total_qty'])
                    print(f"  Bin guncellendi: {warehouse} -> {data['total_qty']}")
                else:
                    # Yeni Bin olustur
                    bin_doc = frappe.get_doc({
                        'doctype': 'Bin',
                        'item_code': item_code,
                        'warehouse': warehouse,
                        'actual_qty': data['total_qty'],
                    })
                    try:
                        bin_doc.insert()
                        print(f"  Bin olusturuldu: {warehouse} -> {data['total_qty']}")
                    except Exception as e:
                        print(f"  Bin olusturulamadi: {e}")
    else:
        print(f"Urun bulunamadi: {item_code}")

frappe.db.commit()
print("\nTamamlandi!")
