from pydantic import BaseModel, Field, field_validator

class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0, description="The number of items to skip (must be >= 0)")
    limit: int = Field(10, ge=1, le=100, description="The number of items to return (1-100)")

    @field_validator('skip')
    @classmethod
    def skip_must_be_non_negative(cls, v: int) -> int:
        """Validate that skip is non-negative."""
        if v < 0:
            raise ValueError('Skip must be greater than or equal to 0')
        return v

    @field_validator('limit')
    @classmethod
    def limit_must_be_valid(cls, v: int) -> int:
        """Validate that limit is between 1 and 100."""
        if v < 1:
            raise ValueError('Limit must be at least 1')
        if v > 100:
            raise ValueError('Limit cannot exceed 100')
        return v
