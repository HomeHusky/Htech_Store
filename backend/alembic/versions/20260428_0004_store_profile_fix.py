"""create or migrate studio_profile -> store_profile

Revision ID: 20260428_0004
Revises: 20260426_0003
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa


revision = "20260428_0004"
down_revision = "20260426_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Create store_profile if missing
    if "store_profile" not in inspector.get_table_names():
        op.create_table(
            "store_profile",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("address", sa.String(), nullable=False, server_default="23 Dong Khoi, District 1, Saigon"),
            sa.Column("email", sa.String(), nullable=False, server_default="hello@htechstudio.vn"),
            sa.Column("bank_name", sa.String(), nullable=False, server_default="Vietcombank"),
            sa.Column("bank_account", sa.String(), nullable=False, server_default="0123 456 789"),
            sa.Column("bank_beneficiary", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("facebook_link", sa.String(), nullable=True),
            sa.Column("instagram_link", sa.String(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    # If legacy studio_profile exists, migrate its data then drop it
    if "studio_profile" in inspector.get_table_names():
        op.execute(
            """
            INSERT INTO store_profile (id, name, address, email, bank_name, bank_account, bank_beneficiary, updated_at)
            SELECT id, name, address, email, bank_name, bank_account, bank_beneficiary, updated_at FROM studio_profile
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              address = EXCLUDED.address,
              email = EXCLUDED.email,
              bank_name = EXCLUDED.bank_name,
              bank_account = EXCLUDED.bank_account,
              bank_beneficiary = EXCLUDED.bank_beneficiary,
              updated_at = EXCLUDED.updated_at
            """
        )
        op.drop_table("studio_profile")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # recreate studio_profile if needed and move data back
    if "studio_profile" not in inspector.get_table_names():
        op.create_table(
            "studio_profile",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("address", sa.String(), nullable=False, server_default="23 Dong Khoi, District 1, Saigon"),
            sa.Column("email", sa.String(), nullable=False, server_default="hello@htechstudio.vn"),
            sa.Column("bank_name", sa.String(), nullable=False, server_default="Vietcombank"),
            sa.Column("bank_account", sa.String(), nullable=False, server_default="0123 456 789"),
            sa.Column("bank_beneficiary", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "store_profile" in inspector.get_table_names():
        op.execute(
            """
            INSERT INTO studio_profile (id, name, address, email, bank_name, bank_account, bank_beneficiary, updated_at)
            SELECT id, name, address, email, bank_name, bank_account, bank_beneficiary, updated_at FROM store_profile
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              address = EXCLUDED.address,
              email = EXCLUDED.email,
              bank_name = EXCLUDED.bank_name,
              bank_account = EXCLUDED.bank_account,
              bank_beneficiary = EXCLUDED.bank_beneficiary,
              updated_at = EXCLUDED.updated_at
            """
        )
        op.drop_table("store_profile")