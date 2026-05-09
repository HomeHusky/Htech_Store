"""init hybrid search schema

Revision ID: 20260426_0001
Revises:
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260426_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    category_enum = postgresql.ENUM("DRESS", "SUIT", "PACKAGE", name="category", create_type=False)
    order_status_enum = postgresql.ENUM(
        "AWAITING_DEPOSIT",
        "PAID",
        "SERVICE_ONGOING",
        "COMPLETED",
        "CANCELLED",
        name="order_status",
        create_type=False,
    )
    category_enum.create(op.get_bind(), checkfirst=True)
    order_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "products",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("name", sa.JSON(), nullable=False),
        sa.Column("category", category_enum, nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("price_per_day", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("image", sa.String(), nullable=False),
        sa.Column("gallery", sa.JSON(), nullable=False),
        sa.Column("description", sa.JSON(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("trending", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("discount", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("embedding", Vector(768), nullable=True),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_products_slug", "products", ["slug"], unique=True)
    op.create_index("ix_products_category", "products", ["category"], unique=False)
    op.create_index("ix_products_search_vector", "products", ["search_vector"], postgresql_using="gin")
    op.execute(
        "CREATE INDEX ix_products_embedding_ivfflat ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_table(
        "store_policies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("policy_type", sa.String(), nullable=False),
        sa.Column("locale", sa.String(), nullable=False, server_default="vi"),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(768), nullable=True),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_store_policies_policy_type", "store_policies", ["policy_type"], unique=False)
    op.create_index("ix_store_policies_locale", "store_policies", ["locale"], unique=False)
    op.create_index("ix_store_policies_search_vector", "store_policies", ["search_vector"], postgresql_using="gin")
    op.execute(
        "CREATE INDEX ix_store_policies_embedding_ivfflat ON store_policies USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("order_number", sa.String(), nullable=False),
        sa.Column("customer", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("total", sa.Integer(), nullable=False),
        sa.Column("deposit", sa.Integer(), nullable=False),
        sa.Column("status", order_status_enum, nullable=False, server_default="AWAITING_DEPOSIT"),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_status", "orders", ["status"], unique=False)

    op.create_table(
        "vouchers",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("discount_percent", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vouchers_code", "vouchers", ["code"], unique=True)

    op.create_table(
        "order_items",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("order_id", sa.String(), nullable=False),
        sa.Column("product_id", sa.String(), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("days", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"], unique=False)
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"], unique=False)

    op.execute(
        """
        CREATE FUNCTION products_search_vector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            to_tsvector('simple',
              coalesce(NEW.name->>'en', '') || ' ' ||
              coalesce(NEW.name->>'vi', '') || ' ' ||
              coalesce(NEW.description->>'en', '') || ' ' ||
              coalesce(NEW.description->>'vi', '')
            );
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_products_search_vector
        BEFORE INSERT OR UPDATE OF name, description
        ON products
        FOR EACH ROW
        EXECUTE FUNCTION products_search_vector_update();
        """
    )

    op.execute(
        """
        CREATE FUNCTION store_policies_search_vector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            to_tsvector('simple',
              coalesce(NEW.title, '') || ' ' ||
              coalesce(NEW.policy_type, '') || ' ' ||
              coalesce(NEW.content, '')
            );
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER trg_store_policies_search_vector
        BEFORE INSERT OR UPDATE OF title, policy_type, content
        ON store_policies
        FOR EACH ROW
        EXECUTE FUNCTION store_policies_search_vector_update();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_store_policies_search_vector ON store_policies")
    op.execute("DROP FUNCTION IF EXISTS store_policies_search_vector_update")
    op.execute("DROP TRIGGER IF EXISTS trg_products_search_vector ON products")
    op.execute("DROP FUNCTION IF EXISTS products_search_vector_update")

    op.drop_index("ix_order_items_product_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_table("order_items")

    op.drop_index("ix_vouchers_code", table_name="vouchers")
    op.drop_table("vouchers")

    op.drop_index("ix_orders_status", table_name="orders")
    op.drop_index("ix_orders_order_number", table_name="orders")
    op.drop_table("orders")

    op.execute("DROP INDEX IF EXISTS ix_store_policies_embedding_ivfflat")
    op.drop_index("ix_store_policies_search_vector", table_name="store_policies")
    op.drop_index("ix_store_policies_locale", table_name="store_policies")
    op.drop_index("ix_store_policies_policy_type", table_name="store_policies")
    op.drop_table("store_policies")

    op.execute("DROP INDEX IF EXISTS ix_products_embedding_ivfflat")
    op.drop_index("ix_products_search_vector", table_name="products")
    op.drop_index("ix_products_category", table_name="products")
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_table("products")

    sa.Enum(name="order_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="category").drop(op.get_bind(), checkfirst=True)
