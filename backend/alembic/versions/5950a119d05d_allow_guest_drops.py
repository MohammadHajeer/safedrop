"""allow guest drops

Revision ID: 5950a119d05d
Revises: 01cb17360b16
Create Date: 2026-08-20 10:31:47.029893

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5950a119d05d'
down_revision: Union[str, Sequence[str], None] = '01cb17360b16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "drops",
        "owner_id",
        existing_type=sa.UUID(),
        nullable=True,
        schema="public",
    )


def downgrade() -> None:
    op.alter_column(
        "drops",
        "owner_id",
        existing_type=sa.UUID(),
        nullable=False,
        schema="public",
    )
