"""refresh AI defaults to supported models

Revision ID: 20260510_0011
Revises: 20260510_0010
Create Date: 2026-05-10
"""

from alembic import op


revision = "20260510_0011"
down_revision = "20260510_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE ai_settings
        SET chat_model = 'gemini-2.0-flash'
        WHERE chat_provider = 'gemini'
          AND chat_model IN ('gemini-1.5-flash', 'models/gemini-1.5-flash')
        """
    )
    op.execute(
        """
        UPDATE ai_settings
        SET embedding_model = 'gemini-embedding-001'
        WHERE embedding_provider = 'gemini'
          AND embedding_model IN ('models/embedding-001', 'embedding-001')
        """
    )


def downgrade() -> None:
    pass
