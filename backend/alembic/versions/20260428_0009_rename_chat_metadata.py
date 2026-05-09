"""rename chat metadata column

Revision ID: 20260428_0009
Revises: 20260428_0008
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260428_0009"
down_revision = "20260428_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "chat_history" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("chat_history")]
        if "metadata" not in columns:
            op.add_column(
                "chat_history",
                sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            )
        bind.execute(sa.text("UPDATE chat_history SET metadata = COALESCE(metadata, message_meta)"))
        if "message_meta" in columns:
            with op.batch_alter_table("chat_history") as batch_op:
                batch_op.drop_column("message_meta")
        try:
            op.drop_index("ix_chat_history_session_created_at", table_name="chat_history")
        except Exception:
            pass
        try:
            op.create_index("ix_chat_history_session_created_at", "chat_history", ["session_id", "created_at"], unique=False)
        except Exception:
            pass


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "chat_history" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("chat_history")]
        if "message_meta" not in columns:
            op.add_column(
                "chat_history",
                sa.Column("message_meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            )
        bind.execute(sa.text("UPDATE chat_history SET message_meta = COALESCE(message_meta, metadata)"))
        if "metadata" in columns:
            with op.batch_alter_table("chat_history") as batch_op:
                batch_op.drop_column("metadata")
