"""Limit Gemini chat defaults to flash models.

Revision ID: 20260510_0013
Revises: 20260510_0012
Create Date: 2026-05-10
"""

from alembic import op


revision = "20260510_0013"
down_revision = "20260510_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE ai_settings
        SET chat_model = CASE
                WHEN chat_provider = 'gemini' AND chat_model IN ('gemini-2.0-flash', 'gemini-2.5-pro')
                    THEN 'gemini-1.5-flash'
                ELSE chat_model
            END,
            query_transformer_model = CASE
                WHEN query_transformer_provider = 'gemini'
                    AND query_transformer_model IN ('gemini-2.0-flash', 'gemini-2.5-pro')
                    THEN 'gemini-1.5-flash'
                ELSE query_transformer_model
            END
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE ai_settings
        SET chat_model = CASE
                WHEN chat_provider = 'gemini' AND chat_model = 'gemini-1.5-flash'
                    THEN 'gemini-2.0-flash'
                ELSE chat_model
            END,
            query_transformer_model = CASE
                WHEN query_transformer_provider = 'gemini' AND query_transformer_model = 'gemini-1.5-flash'
                    THEN 'gemini-2.0-flash'
                ELSE query_transformer_model
            END
        """
    )
