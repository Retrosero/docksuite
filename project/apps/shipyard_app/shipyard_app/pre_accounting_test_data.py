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
    }