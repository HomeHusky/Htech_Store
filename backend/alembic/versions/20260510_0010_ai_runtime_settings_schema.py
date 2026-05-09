"""complete AI runtime settings schema

Revision ID: 20260510_0010
Revises: 20260510_0009
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa


revision = "20260510_0010"
down_revision = "20260510_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ai_settings" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("ai_settings")}

    if "google_client_id" not in columns:
        op.add_column("ai_settings", sa.Column("google_client_id", sa.String(), nullable=True))
    if "google_client_secret" not in columns:
        op.add_column("ai_settings", sa.Column("google_client_secret", sa.String(), nullable=True))
    if "database_url" not in columns:
        op.add_column("ai_settings", sa.Column("database_url", sa.String(), nullable=True))
    if "system_prompt" not in columns:
        op.add_column("ai_settings", sa.Column("system_prompt", sa.Text(), nullable=True))
    if "telegram_bot_token" not in columns:
        op.add_column("ai_settings", sa.Column("telegram_bot_token", sa.String(), nullable=True))
    if "telegram_chat_id" not in columns:
        op.add_column("ai_settings", sa.Column("telegram_chat_id", sa.String(), nullable=True))
    if "updated_at" not in columns:
        op.add_column(
            "ai_settings",
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ai_settings" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("ai_settings")}
    with op.batch_alter_table("ai_settings") as batch_op:
        for column in [
            "updated_at",
            "telegram_chat_id",
            "telegram_bot_token",
            "system_prompt",
            "database_url",
            "google_client_secret",
            "google_client_id",
        ]:
            if column in columns:
                batch_op.drop_column(column)
