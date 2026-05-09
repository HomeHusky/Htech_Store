import sqlalchemy as sa
from app.db.session import engine

conn = engine.connect()
conn.execute(sa.text('''
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR PRIMARY KEY,
    name JSON NOT NULL,
    slug VARCHAR UNIQUE NOT NULL
);
'''))
conn.execute(sa.text('''
INSERT INTO categories (id, slug, name) VALUES 
('LAPTOP', 'laptop', '{"vi": "Laptop", "en": "Laptop"}'),
('MOBILE', 'mobile', '{"vi": "Điện thoại", "en": "Mobile"}'),
('ACCESSORY', 'accessory', '{"vi": "Phụ kiện", "en": "Accessory"}')
ON CONFLICT DO NOTHING;
'''))
conn.execute(sa.text('''
ALTER TABLE products ADD CONSTRAINT fk_category FOREIGN KEY (category) REFERENCES categories(id);
'''))
conn.commit()
print('Categories table created and populated')
