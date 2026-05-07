# -*- coding: utf-8 -*-
"""
Stock Entry Script - ERPNext'te tüm ürünlere örnek fiyat ve stok girişi yapar.
Kullanım: bench --site [site_name] execute update_all_item_prices_and_stock.main

Not: Bu script ERPNext bench ortamında çalıştırılmalıdır.
"""

import frappe
from frappe.utils import nowdate, now_datetime


def main():
    """Tüm aktif ürünlere örnek fiyat ve stok ekle"""
    
    # Aktif ürünleri getir
    items = frappe.get_all(
        "Item",
        filters={"disabled": 0},
        fields=["name", "item_name", "item_group", "stock_uom"]
    )
    
    if not items:
        print("Ürün bulunamadı.")
        return
    
    print(f"Toplam {len(items)} ürün işlenecek...")
    
    # Her ürün için fiyat ve stok girişi
    for idx, item in enumerate(items, 1):
        try:
            # Fiyat Listesi Güncelleme (Varsayılan Satış Fiyatı)
            if frappe.db.exists("Item Price", {"item_code": item.name, "price_list": "Standard Selling"}):
                ep = frappe.get_doc("Item Price", {"item_code": item.name, "price_list": "Standard Selling"})
            else:
                ep = frappe.new_doc("Item Price")
                ep.item_code = item.name
                ep.price_list = "Standard Selling"
                ep.buying = 0
                ep.selling = 1
            
            # Rastgele fiyat oluştur (gruba göre)
            base_price = get_group_base_price(item.get("item_group"))
            ep.price_list_rate = base_price + (idx % 50) * 10  # 10-500 arası
            ep.currency = "TRY"
            ep.uom = item.get("stock_uom", "Nos")
            ep.save(ignore_permissions=True)
            
            # Stok girişi (Stock Entry)
            se = frappe.new_doc("Stock Entry")
            se.stock_entry_type = "Material Receipt"
            se.company = frappe.defaults.get_user_default("company") or "My Company"
            se.posting_date = nowdate()
            se.append("items", {
                "item_code": item.name,
                "t_warehouse": "Stores - " + (frappe.defaults.get_user_default("company") or "M").replace(" ", "")[:3],
                "qty": 10 + (idx % 100),  # 10-110 arası rastgele stok
                "basic_rate": base_price * 0.6,  # Maliyet fiyatı
                "basic_amount": (10 + (idx % 100)) * (base_price * 0.6)
            })
            se.insert(ignore_permissions=True)
            se.submit()
            
            print(f"[{idx}/{len(items)}] {item.name} - Fiyat: {ep.price_list_rate}, Stok: {10 + (idx % 100)}")
            
        except Exception as e:
            print(f"Hata {item.name}: {str(e)}")
            frappe.db.rollback()
    
    frappe.db.commit()
    print(f"\nTamamlandı! {len(items)} ürün güncellendi.")


def get_group_base_price(item_group):
    """Ürün grubuna göre baz fiyat belirle"""
    group_prices = {
        "All Item Groups": 100,
        "Products": 150,
        "Services": 200,
        "Raw Material": 50,
        "Finished Goods": 180,
        "Sub Assemblies": 120,
    }
    return group_prices.get(item_group, 100)


if __name__ == "__main__":
    main()