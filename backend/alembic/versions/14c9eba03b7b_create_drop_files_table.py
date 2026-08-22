"""create drop files table

Revision ID: 14c9eba03b7b
Revises: 5950a119d05d
Create Date: 2026-08-21 11:39:00.345942

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "14c9eba03b7b"
down_revision: Union[str, Sequence[str], None] = "5950a119d05d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "drop_files",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("drop_id", sa.Uuid(), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("content_type", sa.String(length=255), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "storage_deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["drop_id"],
            ["public.drops.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
        schema="public",
    )

    op.create_index(
        op.f("ix_public_drop_files_drop_id"),
        "drop_files",
        ["drop_id"],
        unique=False,
        schema="public",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_public_drop_files_drop_id"),
        table_name="drop_files",
        schema="public",
    )

    op.drop_table(
        "drop_files",
        schema="public",
    )
