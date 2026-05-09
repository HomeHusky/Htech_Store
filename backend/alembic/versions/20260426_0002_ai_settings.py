"""add ai settings table

Revision ID: 20260426_0002
Revises: 20260426_0001
Create Date: 2026-04-26
"""

from alembic import op
import sqlalchemy as sa

revision = "20260426_0002"
down_revision = "20260426_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("chat_provider", sa.String(), nullable=False, server_default="gemini"),
        sa.Column("chat_model", sa.String(), nullable=False, server_default="gemini-1.5-flash"),
        sa.Column("embedding_provider", sa.String(), nullable=False, server_default="gemini"),
        sa.Column("embedding_model", sa.String(), nullable=False, server_default="models/embedding-001"),
        sa.Column("google_client_id", sa.String(), nullable=True),
        sa.Column("google_client_secret", sa.String(), nullable=True),
        sa.Column("database_url", sa.String(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        """
        INSERT INTO ai_settings (id, chat_provider, chat_model, embedding_provider, embedding_model)
        VALUES (1, 'gemini', 'gemini-1.5-flash', 'gemini', 'models/embedding-001')
        ON CONFLICT (id) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("ai_settings")
