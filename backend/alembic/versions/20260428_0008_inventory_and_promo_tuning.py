"""inventory and promo tuning

Revision ID: 20260428_0008
Revises: 20260428_0007
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260428_0008"
down_revision = "20260428_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "vouchers" in inspector.get_table_names():
        with op.batch_alter_table("vouchers") as batch_op:
            batch_op.add_column(sa.Column("min_order_value", sa.Integer(), nullable=False, server_default="0"))
            batch_op.add_column(sa.Column("max_discount_amount", sa.Integer(), nullable=False, server_default="0"))

        bind.execute(sa.text("UPDATE vouchers SET min_order_value = COALESCE(min_order_value, 0), max_discount_amount = COALESCE(max_discount_amount, 0)"))

    if "orders" in inspector.get_table_names():
        with op.batch_alter_table("orders") as batch_op:
            batch_op.add_column(sa.Column("voucher_id", sa.String(), nullable=True))
        try:
            op.create_foreign_key("fk_orders_voucher_id", "orders", "vouchers", ["voucher_id"], ["id"])
        except Exception:
            pass
        try:
            op.create_index("ix_orders_voucher_id", "orders", ["voucher_id"], unique=False)
        except Exception:
            pass

    if "product_variants" not in inspector.get_table_names():
        op.create_table(
            "product_variants",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("product_id", sa.String(), nullable=False),
            sa.Column("sku", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("attributes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
            sa.Column("price", sa.Integer(), nullable=False),
            sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"], unique=False)
        op.create_index("ux_product_variants_sku", "product_variants", ["sku"], unique=True)

    if "chat_sessions" in inspector.get_table_names():
        with op.batch_alter_table("chat_sessions") as batch_op:
            batch_op.alter_column("session_meta", existing_type=sa.JSON(), type_=postgresql.JSONB(astext_type=sa.Text()))

    if "chat_history" in inspector.get_table_names():
        with op.batch_alter_table("chat_history") as batch_op:
            batch_op.alter_column("message_meta", existing_type=sa.JSON(), type_=postgresql.JSONB(astext_type=sa.Text()))

        try:
            op.create_index("ix_chat_history_session_created_at", "chat_history", ["session_id", "created_at"], unique=False)
        except Exception:
            pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "chat_history" in inspector.get_table_names():
        try:
            op.drop_index("ix_chat_history_session_created_at", table_name="chat_history")
        except Exception:
            pass
        with op.batch_alter_table("chat_history") as batch_op:
            try:
                batch_op.alter_column("message_meta", existing_type=postgresql.JSONB(astext_type=sa.Text()), type_=sa.JSON())
            except Exception:
                pass

    if "chat_sessions" in inspector.get_table_names():
        with op.batch_alter_table("chat_sessions") as batch_op:
            try:
                batch_op.alter_column("session_meta", existing_type=postgresql.JSONB(astext_type=sa.Text()), type_=sa.JSON())
            except Exception:
                pass

    if "product_variants" in inspector.get_table_names():
        try:
            op.drop_index("ux_product_variants_sku", table_name="product_variants")
        except Exception:
            pass
        op.drop_table("product_variants")

    if "orders" in inspector.get_table_names():
        try:
            op.drop_index("ix_orders_voucher_id", table_name="orders")
        except Exception:
            pass
        try:
            op.drop_constraint("fk_orders_voucher_id", "orders", type_="foreignkey")
        except Exception:
            pass
        with op.batch_alter_table("orders") as batch_op:
            try:
                batch_op.drop_column("voucher_id")
            except Exception:
                pass

    if "vouchers" in inspector.get_table_names():
        with op.batch_alter_table("vouchers") as batch_op:
            try:
                batch_op.drop_column("max_discount_amount")
            except Exception:
                pass
            try:
                batch_op.drop_column("min_order_value")
            except Exception:
                pass
