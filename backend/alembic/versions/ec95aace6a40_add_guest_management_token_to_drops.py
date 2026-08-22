"""add guest management token to drops

Revision ID: ec95aace6a40
Revises: 7d59c5eb03bb
Create Date: 2026-08-22 14:46:36.972510

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "ec95aace6a40"
down_revision: Union[str, Sequence[str], None] = "7d59c5eb03bb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "drops",
        sa.Column(
            "guest_management_token_hash",
            sa.String(length=64),
            nullable=True,
        ),
        schema="public",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "drops",
        "guest_management_token_hash",
        schema="public",
    )
