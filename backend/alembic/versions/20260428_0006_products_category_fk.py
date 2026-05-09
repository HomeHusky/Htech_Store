"""convert products.category enum -> string FK to categories

Revision ID: 20260428_0006
Revises: 20260428_0005
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260428_0006"
down_revision = "20260428_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # If products table exists and has category column of enum type, migrate
    if "products" in inspector.get_table_names():
        # Create categories table if missing (id, slug, name)
        if "categories" not in inspector.get_table_names():
            op.create_table(
                'categories',
                sa.Column('id', sa.String(), nullable=False),
                sa.Column('slug', sa.String(), nullable=False),
                sa.Column('name', sa.JSON(), nullable=False),
                sa.PrimaryKeyConstraint('id')
            )
            op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)

        # Read existing distinct category values and insert into categories table
        try:
            res = bind.execute(sa.text("SELECT DISTINCT category FROM products"))
            rows = [r[0] for r in res if r[0] is not None]
        except Exception:
            rows = []

        for val in rows:
            cat_id = str(val).lower()
            # insert if not exists; bind name as JSON string
            # bind only id/slug; use literal empty JSON for name to avoid DB param casting issues
            bind.execute(
                sa.text("INSERT INTO categories (id, slug, name) VALUES (:id, :slug, '{}'::json) ON CONFLICT (id) DO NOTHING"),
                {"id": cat_id, "slug": cat_id}
            )

        # Alter column type to text then add foreign key
        with op.batch_alter_table('products') as batch_op:
            try:
                batch_op.alter_column('category', type_=sa.String(), postgresql_using='category::text')
            except Exception:
                # if already text, ignore
                pass
            # add fk constraint if missing
            try:
                existing_fks = [fk.get('name') for fk in inspector.get_foreign_keys('products')]
            except Exception:
                existing_fks = []
            if 'fk_products_category' not in (existing_fks or []):
                try:
                    batch_op.create_foreign_key('fk_products_category', 'categories', ['category'], ['id'])
                except Exception:
                    # ignore if constraint already exists concurrently
                    pass


def downgrade() -> None:
    # Attempt to revert: drop fk and try to recreate enum type
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'products' in inspector.get_table_names():
        with op.batch_alter_table('products') as batch_op:
            try:
                batch_op.drop_constraint('fk_products_category', type_='foreignkey')
            except Exception:
                pass
            try:
                # recreate category enum if necessary (best effort)
                enum = postgresql.ENUM('DRESS','SUIT','PACKAGE', name='category')
                enum.create(bind, checkfirst=True)
                batch_op.alter_column('category', type_=enum, postgresql_using='category::category')
            except Exception:
                pass

    # Note: do not drop categories table in downgrade to avoid data loss
