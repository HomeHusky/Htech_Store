"""complete admin end-to-end schema

Revision ID: 20260510_0009
Revises: 20260510_0008
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260510_0009"
down_revision = "20260510_0008"
branch_labels = None
depends_on = None


def _column_names(inspector: sa.Inspector, table: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table)}


def _create_fk(name: str, source: str, referent: str, local_cols: list[str], remote_cols: list[str]) -> None:
    try:
        op.create_foreign_key(name, source, referent, local_cols, remote_cols)
    except Exception:
        # Existing/local development databases may already have the constraint
        # under an auto-generated name.
        pass


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "orders" in tables:
        columns = _column_names(inspector, "orders")

        if "user_id" not in columns:
            op.add_column("orders", sa.Column("user_id", sa.String(), nullable=True))
            _create_fk("fk_orders_user_id", "orders", "users", ["user_id"], ["id"])
            try:
                op.create_index("ix_orders_user_id", "orders", ["user_id"])
            except Exception:
                pass

        if "shipping_address" not in columns:
            op.add_column("orders", sa.Column("shipping_address", sa.Text(), nullable=True))

        if "voucher_id" not in columns:
            op.add_column("orders", sa.Column("voucher_id", sa.String(), nullable=True))
            _create_fk("fk_orders_voucher_id", "orders", "vouchers", ["voucher_id"], ["id"])
            try:
                op.create_index("ix_orders_voucher_id", "orders", ["voucher_id"])
            except Exception:
                pass

        if "discount_amount" not in columns:
            op.add_column("orders", sa.Column("discount_amount", sa.Integer(), nullable=False, server_default="0"))
            with op.batch_alter_table("orders") as batch_op:
                batch_op.alter_column("discount_amount", server_default=None)

        if "payment_method" not in columns:
            op.add_column("orders", sa.Column("payment_method", sa.String(), nullable=False, server_default="COD"))
            with op.batch_alter_table("orders") as batch_op:
                batch_op.alter_column("payment_method", server_default=None)

        if "payment_status" not in columns:
            op.add_column("orders", sa.Column("payment_status", sa.String(), nullable=False, server_default="PENDING"))
            with op.batch_alter_table("orders") as batch_op:
                batch_op.alter_column("payment_status", server_default=None)

        if "notes" not in columns:
            op.add_column("orders", sa.Column("notes", sa.Text(), nullable=True))

        if "payment_proof" not in columns:
            op.add_column("orders", sa.Column("payment_proof", sa.String(), nullable=True))

        if "updated_at" not in columns:
            op.add_column(
                "orders",
                sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            )

    if bind.dialect.name == "postgresql":
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_type') THEN
                    CREATE TYPE promotion_type AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y');
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_status') THEN
                    CREATE TYPE promotion_status AS ENUM ('ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED');
                END IF;
            END
            $$;
            """
        )

    if "promotions" not in tables:
        promotion_type = sa.Enum("PERCENTAGE", "FIXED", "FREE_SHIPPING", "BUY_X_GET_Y", name="promotion_type")
        promotion_status = sa.Enum("ACTIVE", "SCHEDULED", "EXPIRED", "DISABLED", name="promotion_status")
        if bind.dialect.name == "postgresql":
            promotion_type = postgresql.ENUM(
                "PERCENTAGE",
                "FIXED",
                "FREE_SHIPPING",
                "BUY_X_GET_Y",
                name="promotion_type",
                create_type=False,
            )
            promotion_status = postgresql.ENUM(
                "ACTIVE",
                "SCHEDULED",
                "EXPIRED",
                "DISABLED",
                name="promotion_status",
                create_type=False,
            )

        op.create_table(
            "promotions",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("code", sa.String(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("type", promotion_type, nullable=False),
            sa.Column("value", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("min_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("max_discount", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("usage_limit", sa.Integer(), nullable=False, server_default="100"),
            sa.Column("used_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("start_date", sa.Date(), nullable=False),
            sa.Column("end_date", sa.Date(), nullable=False),
            sa.Column("status", promotion_status, nullable=False, server_default="ACTIVE"),
            sa.Column("applicable_products", sa.String(), nullable=True, server_default="all"),
            sa.Column("category", sa.String(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_promotions_code", "promotions", ["code"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "promotions" in tables:
        op.drop_index("ix_promotions_code", table_name="promotions")
        op.drop_table("promotions")

    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE IF EXISTS promotion_status")
        op.execute("DROP TYPE IF EXISTS promotion_type")

    if "orders" in tables:
        columns = _column_names(inspector, "orders")
        with op.batch_alter_table("orders") as batch_op:
            for column in [
                "updated_at",
                "payment_proof",
                "notes",
                "payment_status",
                "payment_method",
                "discount_amount",
                "voucher_id",
                "shipping_address",
                "user_id",
            ]:
                if column in columns:
                    try:
                        if column == "user_id":
                            batch_op.drop_index("ix_orders_user_id")
                        if column == "voucher_id":
                            batch_op.drop_index("ix_orders_voucher_id")
                    except Exception:
                        pass
                    batch_op.drop_column(column)
