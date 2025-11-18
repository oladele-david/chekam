"""Merge multiple heads

Revision ID: merge_heads_2025_11_18
Revises: 3acb4ca8f29c, 2ce3af1b254c
Create Date: 2025-11-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'merge_heads_2025_11_18'
down_revision: Union[str, None, tuple] = ('3acb4ca8f29c', '2ce3af1b254c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Merge migration - no schema changes needed.
    This migration simply merges two divergent heads into a single head.
    """
    pass


def downgrade() -> None:
    """
    Downgrade will split back into two heads.
    """
    pass
