from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_public_endpoints():
    r = client.get('/api/products')
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)

    r2 = client.get('/api/products/search?q=laptop')
    assert r2.status_code == 200
    j = r2.json()
    assert 'products' in j


def test_admin_endpoints():
    r = client.get('/api/admin/categories')
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    r2 = client.get('/api/admin/orders')
    assert r2.status_code == 200


def test_create_order_and_stock_decrement():
    # pick first product
    prods = client.get('/api/products').json()
    assert len(prods) > 0
    p = prods[0]
    before_stock = p.get('stock', None)

    payload = {
        'customer': 'Smoke Test',
        'email': 'smoke@example.com',
        'phone': '+840000000',
        'event_date': '2026-05-01',
        'items': [
            {'product_id': p['id'], 'qty': 1, 'price': p['basePrice']}
        ]
    }
    r = client.post('/api/orders', json=payload)
    assert r.status_code == 200
    resp = r.json()
    assert 'order_number' in resp

    # verify stock decreased by 1
    p2 = [x for x in client.get('/api/products').json() if x['id'] == p['id']][0]
    if before_stock is not None:
        assert p2['stock'] == before_stock - 1
