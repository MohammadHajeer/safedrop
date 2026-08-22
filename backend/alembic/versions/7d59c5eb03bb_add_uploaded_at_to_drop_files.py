"""add uploaded at to drop files

Revision ID: 7d59c5eb03bb
Revises: 14c9eba03b7b
Create Date: 2026-08-21 14:55:01.938376

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7d59c5eb03bb"
down_revision: Union[str, Sequence[str], None] = "14c9eba03b7b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "drop_files",
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        schema="public",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "drop_files",
        "uploaded_at",
        schema="public",
    )