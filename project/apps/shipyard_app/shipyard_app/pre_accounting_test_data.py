import frappe
from frappe import _

@frappe.whitelist()
def create_demo_company():
    """Demo sirket ve veri olusturur."""
    # Demo Company
    if not frappe.db.exists('Company', 'DEMO-TERSANE-001'):
        company = frappe.get_doc({
            'doctype': 'Company',
            'company_name': 'Demo Tersane A.S.',
            'abbr': 'DTS',
            'default_currency': 'TRY',
            'country': 'Turkey',
            'tax_id': '1234567890',
        })
        company.insert()
        
        # Default Account'lari olustur
        create_default_accounts(company.name)
        
        return {'status': 'created', 'company': company.name}
    
    return {'status': 'exists', 'company': 'DEMO-TERSANE-001'}


def create_default_accounts(company):
    """Varsayilan muhasebe hesaplari olusturur."""
    accounts = [
        {'account_name': 'Kasa', 'account_type': 'Cash', 'parent_account': 'Cari Varliklar - DTS'},
        {'account_name': 'Bankalar', 'account_type': 'Bank', 'parent_account': 'Cari Varliklar - DTS'},
        {'account_name': 'Alacaklar', 'account_type': 'Receivable', 'parent_account': 'Cari Varliklar - DTS'},
        {'account_name': 'Borclar', 'account_type': 'Payable', 'parent_account': 'Cari Borclar - DTS'},
    ]
    
    for acc in accounts:
        if not frappe.db.exists('Account', {'company': company, 'account_name': acc['account_name']}):
            frappe.get_doc({
                'doctype': 'Account',
                'account_name': acc['account_name'],
                'account_type': acc['account_type'],
                'parent_account': acc['parent_account'],
                'company': company,
            }).insert()


@frappe.whitelist()
def create_demo_customers():
    """Demo musteriler olusturur."""
    customers = [
        {'customer_name': 'XYZ Gemi Yapim Ltd.', 'customer_group': 'Commercial', 'territory': 'Turkey'},
        {'customer_name': 'ABC Denizcilik A.S.', 'customer_group': 'Commercial', 'territory': 'Turkey'},
        {'customer_name': 'DEF Lojistik Tic.', 'customer_group': 'Commercial', 'territory': 'Turkey'},
    ]
    
    created = []
    for cust in customers:
        if not frappe.db.exists('Customer', cust['customer_name']):
            doc = frappe.get_doc({
                'doctype': 'Customer',
                'customer_name': cust['customer_name'],
                'customer_group': cust['customer_group'],
                'territory': cust['territory'],
            })
            doc.insert()
            created.append(cust['customer_name'])
    
    return {'status': 'ok', 'created': created}


@frappe.whitelist()
def create_demo_suppliers():
    """Demo tedarikciler olusturur."""
    suppliers = [
        {'supplier_name': 'Malzeme Ticaret Ltd.', 'supplier_group': 'Local', 'country': 'Turkey'},
        {'supplier_name': 'Yedek Parca A.S.', 'supplier_group': 'Local', 'country': 'Turkey'},
        {'supplier_name': 'Hizmet Saglayici Tic.', 'supplier_group': 'Local', 'country': 'Turkey'},
    ]
    
    created = []
    for supp in suppliers:
        if not frappe.db.exists('Supplier', supp['supplier_name']):
            doc = frappe.get_doc({
                'doctype': 'Supplier',
                'supplier_name': supp['supplier_name'],
                'supplier_group': supp['supplier_group'],
                'country': supp['country'],
            })
            doc.insert()
            created.append(supp['supplier_name'])
    
    return {'status': 'ok', 'created': created}


@frappe.whitelist()
def create_demo_items():
    """Demo urunler/hizmetler olusturur."""
    items = [
        {'item_code': 'DEMO-GEMI-001', 'item_name': 'Gemi Yapim Isciligi', 'item_group': 'Services', 'is_stock_item': 0},
        {'item_code': 'DEMO-MALZ-001', 'item_name': 'Celik Plaka', 'item_group': 'Raw Material', 'is_stock_item': 1},
        {'item_code': 'DEMO-MALZ-002', 'item_name': 'Kaynak Malzemesi', 'item_group': 'Raw Material', 'is_stock_item': 1},
        {'item_code': 'DEMO-HIZ-001', 'item_name': 'Tasma Hizmeti', 'item_group': 'Services', 'is_stock_item': 0},
    ]
    
    created = []
    for item in items:
        if not frappe.db.exists('Item', item['item_code']):
            doc = frappe.get_doc({
                'doctype': 'Item',
                **item
            })
            doc.insert()
            created.append(item['item_code'])
    
    return {'status': 'ok', 'created': created}


@frappe.whitelist()
def seed_demo_invoices():
    """Demo faturalar olusturur (son 30 gun)."""
    from datetime import datetime, timedelta
    import random
    
    # Mevcut musterileri al
    customers = frappe.get_all('Customer', pluck='name')
    if not customers:
        return {'status': 'error', 'message': 'Musteri yok, once musterileri olusturun'}
    
    created = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # 10 adet demo fatura
    for i in range(10):
        posting_date = start_date + timedelta(days=random.randint(0, 30))
        
        doc = frappe.get_doc({
            'doctype': 'Sales Invoice',
            'customer': random.choice(customers),
            'posting_date': posting_date.strftime('%Y-%m-%d'),
            'due_date': (posting_date + timedelta(days=30)).strftime('%Y-%m-%d'),
            'currency': 'TRY',
            'items': [{
                'item_code': 'DEMO-GEMI-001',
                'qty': random.randint(1, 10),
                'rate': random.randint(1000, 10000),
            }]
        })
        doc.insert()
        created.append(doc.name)
    
    return {'status': 'ok', 'created': created, 'count': len(created)}


@frappe.whitelist()
def reset_demo_data():
    """Tum demo verilerini siler."""
    # Demo faturalari sil
    frappe.db.delete('Sales Invoice Item', {
        'parent': ('in', frappe.get_all('Sales Invoice', pluck='name'))
    })
    frappe.db.delete('Sales Invoice', {
        'name': ('like', 'DEMO-%')
    })
    
    # Demo urunleri sil
    frappe.db.delete('Item', {
        'name': ('like', 'DEMO-%')
    })
    
    # Demo musterileri sil
    frappe.db.delete('Customer', {
        'name': ('like', '%Demo%')
    })
    
    frappe.db.commit()
    return {'status': 'ok', 'message': 'Demo veriler silindi'}


@frappe.whitelist()
def get_test_status():
    """Test ortami durumunu dondurur."""
    return {
        'company': frappe.db.exists('Company', 'DEMO-TERSANE-001'),
        'customers': len(frappe.get_all('Customer')),
        'suppliers': len(frappe.get_all('Supplier')),
        'items': len(frappe.get_all('Item')),
        'invoices': len(frappe.get_all('Sales Invoice')),
        'customer_groups': len(frappe.get_all('Customer Group')),
        'territories': len(frappe.get_all('Territory')),
        'supplier_groups': len(frappe.get_all('Supplier Group')),
        'item_groups': len(frappe.get_all('Item Group')),
        'uoms': len(frappe.get_all('UOM')),
        'payment_modes': len(frappe.get_all('Mode of Payment')),
    }


@frappe.whitelist()
def seed_master_data():
    """Zorunlu master verileri olusturur."""
    created = {}
    
    # Customer Groups
    if not frappe.db.exists('Customer Group', 'Ticari'):
        frappe.get_doc({
            'doctype': 'Customer Group',
            'customer_group_name': 'Ticari',
            'is_group': 1,
        }).insert()
    
    if not frappe.db.exists('Customer Group', 'Bireysel'):
        frappe.get_doc({
            'doctype': 'Customer Group',
            'customer_group_name': 'Bireysel',
            'is_group': 1,
        }).insert()
    
    created['customer_groups'] = len(frappe.get_all('Customer Group'))
    
    # Territories
    if not frappe.db.exists('Territory', 'Turkiye'):
        frappe.get_doc({
            'doctype': 'Territory',
            'territory_name': 'Turkiye',
            'is_group': 1,
        }).insert()
    
    if not frappe.db.exists('Territory', 'Yurt Disi'):
        frappe.get_doc({
            'doctype': 'Territory',
            'territory_name': 'Yurt Disi',
            'is_group': 1,
        }).insert()
    
    created['territories'] = len(frappe.get_all('Territory'))
    
    # Supplier Groups
    if not frappe.db.exists('Supplier Group', 'Yerel'):
        frappe.get_doc({
            'doctype': 'Supplier Group',
            'supplier_group_name': 'Yerel',
            'is_group': 1,
        }).insert()
    
    if not frappe.db.exists('Supplier Group', 'Yabanci'):
        frappe.get_doc({
            'doctype': 'Supplier Group',
            'supplier_group_name': 'Yabanci',
            'is_group': 1,
        }).insert()
    
    created['supplier_groups'] = len(frappe.get_all('Supplier Group'))
    
    # Item Groups
    if not frappe.db.exists('Item Group', 'Hizmetler'):
        frappe.get_doc({
            'doctype': 'Item Group',
            'item_group_name': 'Hizmetler',
            'is_group': 1,
        }).insert()
    
    if not frappe.db.exists('Item Group', 'Hammadde'):
        frappe.get_doc({
            'doctype': 'Item Group',
            'item_group_name': 'Hammadde',
            'is_group': 1,
        }).insert()
    
    if not frappe.db.exists('Item Group', 'Yari Mamul'):
        frappe.get_doc({
            'doctype': 'Item Group',
            'item_group_name': 'Yari Mamul',
            'is_group': 1,
        }).insert()
    
    created['item_groups'] = len(frappe.get_all('Item Group'))
    
    # UOM
    uoms = [
        {'uom_name': 'Adet', 'short_name': 'AD'},
        {'uom_name': 'Kilogram', 'short_name': 'KG'},
        {'uom_name': 'Metre', 'short_name': 'M'},
        {'uom_name': 'Metrekare', 'short_name': 'M2'},
        {'uom_name': 'Saat', 'short_name': 'SA'},
        {'uom_name': 'Gun', 'short_name': 'GN'},
    ]
    
    for uom in uoms:
        if not frappe.db.exists('UOM', uom['uom_name']):
            frappe.get_doc({
                'doctype': 'UOM',
                **uom,
            }).insert()
    
    created['uoms'] = len(frappe.get_all('UOM'))
    
    # Mode of Payment
    modes = [
        {'mode_of_payment': 'Nakit'},
        {'mode_of_payment': 'Banka Havalesi'},
        {'mode_of_payment': 'Kredi Kartı'},
        {'mode_of_payment': 'Cek'},
        {'mode_of_payment': 'Senet'},
    ]
    
    for mode in modes:
        if not frappe.db.exists('Mode of Payment', mode['mode_of_payment']):
            frappe.get_doc({
                'doctype': 'Mode of Payment',
                **mode,
            }).insert()
    
    created['payment_modes'] = len(frappe.get_all('Mode of Payment'))
    
    return {'status': 'ok', 'created': created}


@frappe.whitelist()
def update_items_with_pricing():
    """Mevcut urunlere fiyat ve stok ekler."""
    items_data = {
        'DEMO-GEMI-001': {'standard_rate': 5000, 'total_qty': 0, 'stock_uom': 'Saat'},
        'DEMO-MALZ-001': {'standard_rate': 250, 'total_qty': 100, 'stock_uom': 'Kilogram'},
        'DEMO-MALZ-002': {'standard_rate': 150, 'total_qty': 50, 'stock_uom': 'Adet'},
        'DEMO-HIZ-001': {'standard_rate': 3000, 'total_qty': 0, 'stock_uom': 'Adet'},
    }
    
    updated = []
    for item_code, data in items_data.items():
        if frappe.db.exists('Item', item_code):
            frappe.db.set_value('Item', item_code, {
                'standard_rate': data['standard_rate'],
                'stock_uom': data['stock_uom'],
            })
            
            # Stok miktarini guncelle
            if data['total_qty'] > 0:
                # Bin qty'yi gunceller
                frappe.db.sql("""
                    UPDATE `tabBin` 
                    SET actual_qty = %s 
                    WHERE item_code = %s
                """, (data['total_qty'], item_code))
                
                # Bin yoksa olustur
                if not frappe.db.get_value('Bin', {'item_code': item_code}, 'name'):
                    frappe.get_doc({
                        'doctype': 'Bin',
                        'item_code': item_code,
                        'warehouse': 'Stores - DTS',
                        'actual_qty': data['total_qty'],
                    }).insert()
            
            updated.append(item_code)
    
    frappe.db.commit()
    return {'status': 'ok', 'updated': updated}


@frappe.whitelist()
def seed_all_demo_data():
    """Tum demo verileri tek seferde olusturur."""
    result = {}
    
    # 1. Master Data
    master_result = seed_master_data()
    result['master_data'] = master_result
    
    # 2. Customers
    customer_result = create_demo_customers()
    result['customers'] = customer_result
    
    # 3. Suppliers  
    supplier_result = create_demo_suppliers()
    result['suppliers'] = supplier_result
    
    # 4. Items
    item_result = create_demo_items()
    result['items'] = item_result
    
    # 5. Update items with pricing
    update_result = update_items_with_pricing()
    result['pricing'] = update_result
    
    return result
