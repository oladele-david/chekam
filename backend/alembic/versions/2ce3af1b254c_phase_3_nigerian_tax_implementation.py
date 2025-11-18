"""Phase 3: Nigerian Tax Implementation (2026)

Revision ID: 2ce3af1b254c
Revises: ac776ce9d732
Create Date: 2025-11-18 00:00:00.000000

Creates tax-related tables and seeds 2026 Nigerian tax brackets.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ce3af1b254c'
down_revision: Union[str, None] = 'ac776ce9d732'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create tax tables and seed 2026 Nigerian tax brackets.
    """
    # 1. Create tax_brackets table
    op.create_table(
        'tax_brackets',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('bracket_order', sa.Integer(), nullable=False),
        sa.Column('min_income', sa.Numeric(15, 2), nullable=False),
        sa.Column('max_income', sa.Numeric(15, 2), nullable=True),
        sa.Column('rate', sa.Numeric(5, 4), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('rate >= 0 AND rate <= 1', name='check_rate_range'),
        sa.CheckConstraint('min_income >= 0', name='check_min_income_positive'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tax_brackets_id', 'tax_brackets', ['id'], unique=False)
    op.create_index('ix_tax_brackets_year', 'tax_brackets', ['year'], unique=False)

    # 2. Create tax_calculations table
    op.create_table(
        'tax_calculations',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('calculation_year', sa.Integer(), nullable=False),
        sa.Column('gross_income', sa.Numeric(15, 2), nullable=False),
        sa.Column('total_reliefs', sa.Numeric(15, 2), nullable=False, server_default='0'),
        sa.Column('taxable_income', sa.Numeric(15, 2), nullable=False),
        sa.Column('gross_tax', sa.Numeric(15, 2), nullable=False),
        sa.Column('net_tax', sa.Numeric(15, 2), nullable=False),
        sa.Column('tax_bracket_breakdown', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tax_calculations_id', 'tax_calculations', ['id'], unique=False)
    op.create_index('ix_tax_calculations_user_id', 'tax_calculations', ['user_id'], unique=False)
    op.create_index('ix_tax_calculations_calculation_year', 'tax_calculations', ['calculation_year'], unique=False)

    # 3. Create tax_reliefs table
    op.create_table(
        'tax_reliefs',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('relief_type', sa.Text(), nullable=False),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('verified', sa.Text(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint(
            "relief_type IN ('rent', 'pension', 'nhf', 'nhis', 'life_insurance', 'gratuity', 'other')",
            name='check_relief_type'
        ),
        sa.CheckConstraint('amount >= 0', name='check_relief_amount_positive'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tax_reliefs_id', 'tax_reliefs', ['id'], unique=False)
    op.create_index('ix_tax_reliefs_user_id', 'tax_reliefs', ['user_id'], unique=False)
    op.create_index('ix_tax_reliefs_year', 'tax_reliefs', ['year'], unique=False)

    # 4. Seed 2026 Nigerian tax brackets
    # Based on Nigeria Tax Act 2025, effective January 1, 2026
    op.execute("""
        INSERT INTO tax_brackets (year, bracket_order, min_income, max_income, rate, description)
        VALUES
            (2026, 1, 0, 800000, 0.0000, '₦0 - ₦800,000 at 0% (Tax-Free)'),
            (2026, 2, 800001, 3200000, 0.1500, '₦800,001 - ₦3,200,000 at 15%'),
            (2026, 3, 3200001, 6400000, 0.1800, '₦3,200,001 - ₦6,400,000 at 18%'),
            (2026, 4, 6400001, 12800000, 0.2100, '₦6,400,001 - ₦12,800,000 at 21%'),
            (2026, 5, 12800001, 50000000, 0.2300, '₦12,800,001 - ₦50,000,000 at 23%'),
            (2026, 6, 50000001, NULL, 0.2500, '₦50,000,001 and above at 25%')
    """)


def downgrade() -> None:
    """
    Remove tax tables and data.
    """
    # Drop tables in reverse order (due to foreign key constraints)
    op.drop_index('ix_tax_reliefs_year', 'tax_reliefs')
    op.drop_index('ix_tax_reliefs_user_id', 'tax_reliefs')
    op.drop_index('ix_tax_reliefs_id', 'tax_reliefs')
    op.drop_table('tax_reliefs')

    op.drop_index('ix_tax_calculations_calculation_year', 'tax_calculations')
    op.drop_index('ix_tax_calculations_user_id', 'tax_calculations')
    op.drop_index('ix_tax_calculations_id', 'tax_calculations')
    op.drop_table('tax_calculations')

    op.drop_index('ix_tax_brackets_year', 'tax_brackets')
    op.drop_index('ix_tax_brackets_id', 'tax_brackets')
    op.drop_table('tax_brackets')
