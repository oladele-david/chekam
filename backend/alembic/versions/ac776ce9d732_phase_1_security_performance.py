"""Phase 1: Security and Performance Improvements

Revision ID: ac776ce9d732
Revises: 8e9b8bb258c5
Create Date: 2025-11-17 22:00:00.000000

Changes:
- Fix is_active column type from Text to Boolean in users table
- Add index on users.email for faster login queries
- Add indexes on foreign keys for better query performance:
  - transactions.user_id
  - transactions.category_id
  - budgets.user_id
  - budgets.category_id
  - categories.user_id
  - categories.predefined_category_id
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ac776ce9d732'
down_revision: Union[str, None] = '8e9b8bb258c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Apply Phase 1 database improvements.
    """
    # 1. Fix is_active column type from Text to Boolean in users table
    # Note: This uses a safe migration approach that handles existing data
    op.execute("""
        ALTER TABLE users
        ALTER COLUMN is_active TYPE BOOLEAN
        USING CASE
            WHEN is_active::text = 'True' OR is_active::text = '1' OR is_active::text = 'true' THEN TRUE
            WHEN is_active::text = 'False' OR is_active::text = '0' OR is_active::text = 'false' THEN FALSE
            ELSE TRUE
        END
    """)

    # Set NOT NULL constraint on is_active
    op.alter_column('users', 'is_active', nullable=False)

    # 2. Add index on users.email for faster login queries
    # (Note: email already has unique constraint which creates an index,
    # but we'll make it explicit for clarity)
    op.create_index('ix_users_email', 'users', ['email'], unique=True, if_not_exists=True)

    # 3. Add indexes on foreign keys for better query performance

    # Transactions table indexes
    op.create_index('ix_transactions_user_id', 'transactions', ['user_id'], if_not_exists=True)
    op.create_index('ix_transactions_category_id', 'transactions', ['category_id'], if_not_exists=True)

    # Budgets table indexes
    op.create_index('ix_budgets_user_id', 'budgets', ['user_id'], if_not_exists=True)
    op.create_index('ix_budgets_category_id', 'budgets', ['category_id'], if_not_exists=True)

    # Categories table indexes
    op.create_index('ix_categories_user_id', 'categories', ['user_id'], if_not_exists=True)
    op.create_index('ix_categories_predefined_category_id', 'categories', ['predefined_category_id'], if_not_exists=True)


def downgrade() -> None:
    """
    Rollback Phase 1 database improvements.
    """
    # Remove indexes (in reverse order)
    op.drop_index('ix_categories_predefined_category_id', 'categories', if_exists=True)
    op.drop_index('ix_categories_user_id', 'categories', if_exists=True)
    op.drop_index('ix_budgets_category_id', 'budgets', if_exists=True)
    op.drop_index('ix_budgets_user_id', 'budgets', if_exists=True)
    op.drop_index('ix_transactions_category_id', 'transactions', if_exists=True)
    op.drop_index('ix_transactions_user_id', 'transactions', if_exists=True)
    op.drop_index('ix_users_email', 'users', if_exists=True)

    # Revert is_active column type from Boolean back to Text
    op.alter_column('users', 'is_active', nullable=True)
    op.execute("""
        ALTER TABLE users
        ALTER COLUMN is_active TYPE TEXT
        USING CASE
            WHEN is_active = TRUE THEN 'True'
            WHEN is_active = FALSE THEN 'False'
            ELSE 'True'
        END
    """)
