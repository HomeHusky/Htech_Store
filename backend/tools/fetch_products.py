import requests

url = "http://127.0.0.1:8000/api/products"
try:
    r = requests.get(url, timeout=10)
    print('status', r.status_code)
    print(r.text[:2000])
except Exception as e:
    print('error', repr(e))
