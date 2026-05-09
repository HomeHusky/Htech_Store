"""add studio profile table

Revision ID: 20260426_0003
Revises: 20260426_0002
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa


revision = "20260426_0003"
down_revision = "20260426_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "studio_profile" not in inspector.get_table_names():
        op.create_table(
            "studio_profile",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("address", sa.String(), nullable=False, server_default="23 Dong Khoi, District 1, Saigon"),
            sa.Column("email", sa.String(), nullable=False, server_default="hello@maisonlumiere.vn"),
            sa.Column("bank_name", sa.String(), nullable=False, server_default="Vietcombank"),
            sa.Column("bank_account", sa.String(), nullable=False, server_default="0123 456 789"),
            sa.Column("bank_beneficiary", sa.String(), nullable=False, server_default="Htech"),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    op.execute(
        """
        INSERT INTO studio_profile (id, name, address, email, bank_name, bank_account, bank_beneficiary)
        VALUES (1, 'Htech', '23 Dong Khoi, District 1, Saigon', 'hello@maisonlumiere.vn', 'Vietcombank', '0123 456 789', 'Htech')
        ON CONFLICT (id) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("studio_profile")
