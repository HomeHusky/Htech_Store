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
('DRESS', 'dress', '{"vi": "Váy cưới", "en": "Wedding Dress"}'),
('SUIT', 'suit', '{"vi": "Vest nam", "en": "Suit"}'),
('PACKAGE', 'package', '{"vi": "Gói chụp ảnh", "en": "Photography Package"}')
ON CONFLICT DO NOTHING;
'''))
conn.execute(sa.text('''
ALTER TABLE products ADD CONSTRAINT fk_category FOREIGN KEY (category) REFERENCES categories(id);
'''))
conn.commit()
print('Categories table created and populated')
