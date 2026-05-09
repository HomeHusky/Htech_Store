"""enhance store schema for hierarchy, reviews, chat, and payments

Revision ID: 20260428_0007
Revises: 20260428_0006
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa


revision = "20260428_0007"
down_revision = "20260428_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "categories" in inspector.get_table_names():
        with op.batch_alter_table("categories") as batch_op:
            batch_op.add_column(sa.Column("parent_id", sa.String(), nullable=True))
        try:
            op.create_foreign_key("fk_categories_parent_id", "categories", "categories", ["parent_id"], ["id"])
        except Exception:
            pass
        try:
            op.create_index("ix_categories_parent_id", "categories", ["parent_id"], unique=False)
        except Exception:
            pass

    if "products" in inspector.get_table_names():
        with op.batch_alter_table("products") as batch_op:
            batch_op.add_column(sa.Column("sku", sa.String(), nullable=True))

        bind.execute(sa.text("UPDATE products SET sku = upper(replace(slug, '-', '_')) WHERE sku IS NULL OR sku = ''"))
        try:
            op.create_index("ux_products_sku", "products", ["sku"], unique=True)
        except Exception:
            pass

    if "orders" in inspector.get_table_names():
        with op.batch_alter_table("orders") as batch_op:
            batch_op.add_column(sa.Column("shipping_address", sa.Text(), nullable=True))
            batch_op.add_column(sa.Column("payment_method", sa.String(), nullable=False, server_default="COD"))
            batch_op.add_column(sa.Column("payment_status", sa.String(), nullable=False, server_default="PENDING"))

        bind.execute(sa.text("UPDATE orders SET shipping_address = COALESCE(shipping_address, 'Htech Store, Hanoi')"))
        bind.execute(
            sa.text(
                """
                UPDATE orders
                SET payment_method = CASE
                    WHEN status IN ('PAID', 'COMPLETED') THEN 'BANK_TRANSFER'
                    WHEN status = 'SERVICE_ONGOING' THEN 'COD'
                    WHEN status = 'CANCELLED' THEN 'COD'
                    ELSE 'COD'
                END,
                payment_status = CASE
                    WHEN status IN ('PAID', 'COMPLETED') THEN 'PAID'
                    WHEN status = 'SERVICE_ONGOING' THEN 'PROCESSING'
                    WHEN status = 'CANCELLED' THEN 'CANCELLED'
                    ELSE 'PENDING'
                END
                """
            )
        )

    if "order_items" in inspector.get_table_names():
        with op.batch_alter_table("order_items") as batch_op:
            batch_op.add_column(sa.Column("warranty_expiry", sa.Date(), nullable=True))

        bind.execute(
            sa.text(
                """
                UPDATE order_items oi
                SET warranty_expiry = (
                    o.event_date + CASE
                        WHEN p.category = 'repair' THEN INTERVAL '90 days'
                        ELSE INTERVAL '365 days'
                    END
                )::date
                FROM orders o, products p
                WHERE oi.order_id = o.id
                  AND p.id = oi.product_id
                  AND oi.warranty_expiry IS NULL
                """
            )
        )

    if "product_attributes" not in inspector.get_table_names():
        op.create_table(
            "product_attributes",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("product_id", sa.String(), nullable=False),
            sa.Column("attr_key", sa.String(), nullable=False),
            sa.Column("attr_label", sa.String(), nullable=False),
            sa.Column("attr_value", sa.Text(), nullable=False),
            sa.Column("unit", sa.String(), nullable=True),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_product_attributes_product_id", "product_attributes", ["product_id"], unique=False)
        op.create_index("ix_product_attributes_attr_key", "product_attributes", ["attr_key"], unique=False)

    if "product_reviews" not in inspector.get_table_names():
        op.create_table(
            "product_reviews",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("product_id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("rating", sa.Integer(), nullable=False),
            sa.Column("comment", sa.Text(), nullable=False),
            sa.Column("images", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
            sa.Column("locale", sa.String(), nullable=False, server_default="vi"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_product_reviews_product_id", "product_reviews", ["product_id"], unique=False)

    if "faqs" not in inspector.get_table_names():
        op.create_table(
            "faqs",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("locale", sa.String(), nullable=False, server_default="vi"),
            sa.Column("question", sa.Text(), nullable=False),
            sa.Column("answer", sa.Text(), nullable=False),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_faqs_locale", "faqs", ["locale"], unique=False)

    if "chat_sessions" not in inspector.get_table_names():
        op.create_table(
            "chat_sessions",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("locale", sa.String(), nullable=False, server_default="vi"),
            sa.Column("session_meta", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"], unique=False)

    if "chat_history" not in inspector.get_table_names():
        op.create_table(
            "chat_history",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("session_id", sa.String(), nullable=False),
            sa.Column("user_id", sa.String(), nullable=True),
            sa.Column("role", sa.String(), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("message_meta", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["session_id"], ["chat_sessions.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_chat_history_session_id", "chat_history", ["session_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "chat_history" in inspector.get_table_names():
        op.drop_table("chat_history")
    if "chat_sessions" in inspector.get_table_names():
        op.drop_table("chat_sessions")
    if "faqs" in inspector.get_table_names():
        op.drop_table("faqs")
    if "product_reviews" in inspector.get_table_names():
        op.drop_table("product_reviews")
    if "product_attributes" in inspector.get_table_names():
        op.drop_table("product_attributes")

    if "order_items" in inspector.get_table_names():
        with op.batch_alter_table("order_items") as batch_op:
            try:
                batch_op.drop_column("warranty_expiry")
            except Exception:
                pass

    if "orders" in inspector.get_table_names():
        with op.batch_alter_table("orders") as batch_op:
            try:
                batch_op.drop_column("payment_status")
            except Exception:
                pass
            try:
                batch_op.drop_column("payment_method")
            except Exception:
                pass
            try:
                batch_op.drop_column("shipping_address")
            except Exception:
                pass

    if "products" in inspector.get_table_names():
        try:
            op.drop_index("ux_products_sku", table_name="products")
        except Exception:
            pass
        with op.batch_alter_table("products") as batch_op:
            try:
                batch_op.drop_column("sku")
            except Exception:
                pass

    if "categories" in inspector.get_table_names():
        try:
            op.drop_index("ix_categories_parent_id", table_name="categories")
        except Exception:
            pass
        try:
            op.drop_constraint("fk_categories_parent_id", "categories", type_="foreignkey")
        except Exception:
            pass
        with op.batch_alter_table("categories") as batch_op:
            try:
                batch_op.drop_column("parent_id")
            except Exception:
                pass
