"""
Tax schemas for Nigerian PAYE tax system.
"""
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List
from datetime import datetime
from decimal import Decimal


# ============================================================================
# Tax Bracket Schemas
# ============================================================================

class TaxBracketBase(BaseModel):
    """Base schema for tax brackets."""
    year: int
    bracket_order: int
    min_income: float
    max_income: Optional[float] = None
    rate: float
    description: Optional[str] = None

    @field_validator('year')
    @classmethod
    def year_must_be_valid(cls, v: int) -> int:
        """Validate year is reasonable."""
        if v < 2020 or v > 2100:
            raise ValueError('Year must be between 2020 and 2100')
        return v

    @field_validator('rate')
    @classmethod
    def rate_must_be_valid(cls, v: float) -> float:
        """Validate rate is between 0 and 1."""
        if v < 0 or v > 1:
            raise ValueError('Rate must be between 0 and 1 (e.g., 0.15 for 15%)')
        return v

    @field_validator('min_income')
    @classmethod
    def min_income_must_be_non_negative(cls, v: float) -> float:
        """Validate min_income is non-negative."""
        if v < 0:
            raise ValueError('Minimum income must be non-negative')
        return v


class TaxBracketCreate(TaxBracketBase):
    """Schema for creating a tax bracket."""
    pass


class TaxBracket(TaxBracketBase):
    """Schema for tax bracket with ID."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Tax Relief Schemas
# ============================================================================

class TaxReliefBase(BaseModel):
    """Base schema for tax reliefs."""
    relief_type: str
    amount: float
    year: int
    description: Optional[str] = None

    @field_validator('relief_type')
    @classmethod
    def relief_type_must_be_valid(cls, v: str) -> str:
        """Validate relief type is allowed."""
        allowed_types = ['rent', 'pension', 'nhf', 'nhis', 'life_insurance', 'gratuity', 'other']
        if v not in allowed_types:
            raise ValueError(f'Relief type must be one of: {", ".join(allowed_types)}')
        return v

    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        """Validate amount is positive."""
        if v <= 0:
            raise ValueError('Relief amount must be greater than 0')
        return v

    @field_validator('year')
    @classmethod
    def year_must_be_valid(cls, v: int) -> int:
        """Validate year is reasonable."""
        if v < 2020 or v > 2100:
            raise ValueError('Year must be between 2020 and 2100')
        return v


class TaxReliefCreate(TaxReliefBase):
    """Schema for creating a tax relief."""
    user_id: int


class TaxReliefUpdate(BaseModel):
    """Schema for updating a tax relief."""
    amount: Optional[float] = None
    description: Optional[str] = None
    verified: Optional[bool] = None

    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        """Validate amount is positive if provided."""
        if v is not None and v <= 0:
            raise ValueError('Relief amount must be greater than 0')
        return v


class TaxRelief(TaxReliefBase):
    """Schema for tax relief with ID."""
    id: int
    user_id: int
    verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# Tax Calculation Schemas
# ============================================================================

class TaxCalculationRequest(BaseModel):
    """Schema for requesting tax calculation."""
    gross_income: float
    year: int = 2026
    reliefs: Optional[Dict[str, float]] = None  # e.g., {"rent": 500000, "pension": 100000}

    @field_validator('gross_income')
    @classmethod
    def gross_income_must_be_positive(cls, v: float) -> float:
        """Validate gross income is positive."""
        if v <= 0:
            raise ValueError('Gross income must be greater than 0')
        return v

    @field_validator('year')
    @classmethod
    def year_must_be_valid(cls, v: int) -> int:
        """Validate year is reasonable."""
        if v < 2020 or v > 2100:
            raise ValueError('Year must be between 2020 and 2100')
        return v


class BracketTaxBreakdown(BaseModel):
    """Breakdown of tax by bracket."""
    bracket_order: int
    min_income: float
    max_income: Optional[float]
    rate: float
    taxable_in_bracket: float
    tax_in_bracket: float


class TaxCalculationResponse(BaseModel):
    """Schema for tax calculation response."""
    gross_income: float
    total_reliefs: float
    taxable_income: float
    gross_tax: float
    net_tax: float
    effective_rate: float  # Percentage
    breakdown_by_bracket: List[BracketTaxBreakdown]
    year: int

    class Config:
        from_attributes = True


class TaxCalculationBase(BaseModel):
    """Base schema for stored tax calculations."""
    calculation_year: int
    gross_income: float
    total_reliefs: float
    taxable_income: float
    gross_tax: float
    net_tax: float
    tax_bracket_breakdown: Optional[str] = None
    notes: Optional[str] = None


class TaxCalculationCreate(TaxCalculationBase):
    """Schema for creating a tax calculation record."""
    user_id: int


class TaxCalculation(TaxCalculationBase):
    """Schema for tax calculation with ID."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Tax Summary Schemas
# ============================================================================

class AnnualTaxEstimate(BaseModel):
    """Schema for annual tax estimate based on current income."""
    current_monthly_income: float
    estimated_annual_income: float
    estimated_annual_tax: float
    estimated_monthly_tax: float
    estimated_take_home_monthly: float
    year: int


class TaxHistory(BaseModel):
    """Schema for user's tax history."""
    calculations: List[TaxCalculation]
    total_calculations: int
