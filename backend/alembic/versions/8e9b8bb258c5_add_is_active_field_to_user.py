"""Add is_active field to User

Revision ID: 8e9b8bb258c5
Revises: 59b8ab887ef0
Create Date: 2024-10-02 14:03:28.400825

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e9b8bb258c5'
down_revision: Union[str, None] = '59b8ab887ef0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
