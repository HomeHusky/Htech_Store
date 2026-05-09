"""add variant_id to order_items and discount_amount to orders

Revision ID: 20260428_0010
Revises: 20260428_0009
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260428_0010"
down_revision = "20260428_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # add discount_amount to orders
    if "orders" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("orders")]
        if "discount_amount" not in cols:
            op.add_column(
                "orders",
                sa.Column("discount_amount", sa.Integer(), nullable=False, server_default="0"),
            )
            # remove server_default to match ORM default behavior
            with op.batch_alter_table("orders") as batch_op:
                batch_op.alter_column("discount_amount", server_default=None)

    # add variant_id to order_items
    if "order_items" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("order_items")]
        if "variant_id" not in cols:
            op.add_column(
                "order_items",
                sa.Column("variant_id", sa.String(), nullable=True),
            )
            try:
                op.create_foreign_key(
                    "fk_order_items_variant",
                    "order_items",
                    "product_variants",
                    ["variant_id"],
                    ["id"],
                    ondelete="SET NULL",
                )
            except Exception:
                pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "order_items" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("order_items")]
        if "variant_id" in cols:
            with op.batch_alter_table("order_items") as batch_op:
                try:
                    batch_op.drop_constraint("fk_order_items_variant", type_="foreignkey")
                except Exception:
                    pass
                batch_op.drop_column("variant_id")

    if "orders" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("orders")]
        if "discount_amount" in cols:
            with op.batch_alter_table("orders") as batch_op:
                batch_op.drop_column("discount_amount")
