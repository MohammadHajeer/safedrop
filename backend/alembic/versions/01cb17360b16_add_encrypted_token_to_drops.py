"""add encrypted token to drops

Revision ID: 01cb17360b16
Revises: 9ff006cdf27d
Create Date: 2026-08-19 19:26:25.812270

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "01cb17360b16"
down_revision: Union[str, Sequence[str], None] = "9ff006cdf27d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "drops",
        sa.Column("encrypted_token", sa.Text(), nullable=True),
        schema="public",
    )


def downgrade() -> None:
    op.drop_column(
        "drops",
        "encrypted_token",
        schema="public",
    )
