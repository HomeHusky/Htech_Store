"""rebrand htech store: rename columns and drop legacy rental fields

Revision ID: 20260510_0008
Revises: 20260428_0007
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa

revision = "20260510_0008"
down_revision = "20260428_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Rename price_per_day to is_trade_in
    if "products" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("products")]
        if "price_per_day" in columns and "is_trade_in" not in columns:
            op.alter_column("products", "price_per_day", new_column_name="is_trade_in")
        elif "is_trade_in" not in columns:
            op.add_column("products", sa.Column("is_trade_in", sa.Boolean(), nullable=False, server_default=sa.text("false")))

        # Add missing tech-store columns
        if "brand" not in columns:
            op.add_column("products", sa.Column("brand", sa.String(), nullable=False, server_default="Htech"))
        if "tagline" not in columns:
            op.add_column("products", sa.Column("tagline", sa.JSON(), nullable=True))
        if "highlight_specs" not in columns:
            op.add_column("products", sa.Column("highlight_specs", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")))
        if "is_new" not in columns:
            op.add_column("products", sa.Column("is_new", sa.Boolean(), nullable=False, server_default=sa.text("false")))
        if "stock" not in columns:
            op.add_column("products", sa.Column("stock", sa.Integer(), nullable=False, server_default="10"))
        if "rating" not in columns:
            op.add_column("products", sa.Column("rating", sa.Float(), nullable=False, server_default="5"))
        if "review_count" not in columns:
            op.add_column("products", sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"))

    # Rename event_date to expected_delivery
    if "orders" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("orders")]
        if "event_date" in columns and "expected_delivery" not in columns:
            op.alter_column("orders", "event_date", new_column_name="expected_delivery")
        elif "expected_delivery" not in columns:
            op.add_column("orders", sa.Column("expected_delivery", sa.Date(), nullable=False, server_default=sa.text("now()")))

    # Drop days from order_items
    if "order_items" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("order_items")]
        if "days" in columns:
            op.drop_column("order_items", "days")


def downgrade() -> None:
    # Reverse changes
    op.alter_column("products", "is_trade_in", new_column_name="price_per_day")
    op.alter_column("orders", "expected_delivery", new_column_name="event_date")
    op.add_column("order_items", sa.Column("days", sa.Integer(), nullable=True))
