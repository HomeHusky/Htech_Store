"""create missing tables: users, categories, store_settings, theme tables, repairs

Revision ID: 20260428_0005
Revises: 20260428_0004
Create Date: 2026-04-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260428_0005"
down_revision = "20260428_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Enums
    # inspector.get_enums() may return dicts or objects depending on SQLAlchemy version
    existing_enums_raw = sa.inspect(bind).get_enums()
    existing_enum_names = []
    for t in existing_enums_raw:
        if isinstance(t, dict):
            name = t.get('name')
        else:
            name = getattr(t, 'name', None)
        if name:
            existing_enum_names.append(name)

    op.execute("DO $$ BEGIN CREATE TYPE user_role AS ENUM ('USER', 'STAFF', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE user_permission AS ENUM ('NONE', 'READ_ONLY', 'FULL'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE repair_status AS ENUM ('received', 'testing', 'fixing', 'ready', 'delivered'); EXCEPTION WHEN duplicate_object THEN null; END $$;")

    # Users
    if 'users' not in inspector.get_table_names():
        op.create_table(
            'users',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
            sa.Column('hashed_password', sa.String(), nullable=True),
            sa.Column('full_name', sa.String(), nullable=True),
            sa.Column('role', postgresql.ENUM('USER', 'STAFF', 'ADMIN', name='user_role', create_type=False), nullable=False, server_default='USER'),
            sa.Column('permission', postgresql.ENUM('NONE', 'READ_ONLY', 'FULL', name='user_permission', create_type=False), nullable=False, server_default='NONE'),
            sa.Column('google_id', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_users_email', 'users', ['email'], unique=True)
        op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Categories
    if 'categories' not in inspector.get_table_names():
        op.create_table(
            'categories',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False),
            sa.Column('name', sa.JSON(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)

    # Store settings
    if 'store_settings' not in inspector.get_table_names():
        op.create_table(
            'store_settings',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('deposit_percentage', sa.Integer(), nullable=False, server_default='20'),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.execute("INSERT INTO store_settings (id, deposit_percentage) VALUES ('default', 20) ON CONFLICT (id) DO NOTHING")

    # Theme palettes
    if 'theme_palettes' not in inspector.get_table_names():
        op.create_table(
            'theme_palettes',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('is_preset', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('light_main', sa.String(), nullable=False, server_default='#FFFFFF'),
            sa.Column('light_sub', sa.String(), nullable=False, server_default='#2C3E50'),
            sa.Column('light_accent', sa.String(), nullable=False, server_default='#007AFF'),
            sa.Column('dark_main', sa.String(), nullable=False, server_default='#121212'),
            sa.Column('dark_sub', sa.String(), nullable=False, server_default='#1E293B'),
            sa.Column('dark_accent', sa.String(), nullable=False, server_default='#3B82F6'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
    if 'theme_settings' not in inspector.get_table_names():
        op.create_table(
            'theme_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('active_palette_id', sa.String(), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.execute("INSERT INTO theme_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING")

    # Repairs and notes
    if 'repairs' not in inspector.get_table_names():
        op.create_table(
            'repairs',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('customer_name', sa.String(), nullable=False),
            sa.Column('device_name', sa.String(), nullable=False),
            sa.Column('issue', sa.Text(), nullable=False),
            sa.Column('status', postgresql.ENUM('received','testing','fixing','ready','delivered', name='repair_status', create_type=False), nullable=False, server_default='received'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
    if 'repair_notes' not in inspector.get_table_names():
        op.create_table(
            'repair_notes',
            sa.Column('id', sa.String(), nullable=False),
            sa.Column('repair_id', sa.String(), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['repair_id'], ['repairs.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if 'repair_notes' in inspector.get_table_names():
        op.drop_table('repair_notes')
    if 'repairs' in inspector.get_table_names():
        op.drop_table('repairs')
    if 'theme_settings' in inspector.get_table_names():
        op.drop_table('theme_settings')
    if 'theme_palettes' in inspector.get_table_names():
        op.drop_table('theme_palettes')
    if 'store_settings' in inspector.get_table_names():
        op.drop_table('store_settings')
    if 'categories' in inspector.get_table_names():
        op.drop_table('categories')
    if 'users' in inspector.get_table_names():
        op.drop_table('users')

    # Drop enums
    try:
        sa.Enum(name='repair_status').drop(bind, checkfirst=True)
    except Exception:
        pass
    try:
        sa.Enum(name='user_permission').drop(bind, checkfirst=True)
    except Exception:
        pass
    try:
        sa.Enum(name='user_role').drop(bind, checkfirst=True)
    except Exception:
        pass