"""add AI agent routing settings

Revision ID: 20260510_0012
Revises: 20260510_0011
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa


revision = "20260510_0012"
down_revision = "20260510_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ai_settings" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("ai_settings")}
    if "chat_model_order" not in columns:
        op.add_column("ai_settings", sa.Column("chat_model_order", sa.JSON(), nullable=True))
    if "task_model_config" not in columns:
        op.add_column("ai_settings", sa.Column("task_model_config", sa.JSON(), nullable=True))
    if "reasoning_model_count" not in columns:
        op.add_column("ai_settings", sa.Column("reasoning_model_count", sa.Integer(), nullable=False, server_default="1"))
        with op.batch_alter_table("ai_settings") as batch_op:
            batch_op.alter_column("reasoning_model_count", server_default=None)
    if "query_transformer_provider" not in columns:
        op.add_column("ai_settings", sa.Column("query_transformer_provider", sa.String(), nullable=True))
    if "query_transformer_model" not in columns:
        op.add_column("ai_settings", sa.Column("query_transformer_model", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ai_settings" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("ai_settings")}
    with op.batch_alter_table("ai_settings") as batch_op:
        for column in [
            "query_transformer_model",
            "query_transformer_provider",
            "reasoning_model_count",
            "task_model_config",
            "chat_model_order",
        ]:
            if column in columns:
                batch_op.drop_column(column)
