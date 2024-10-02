from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    skip: int = Field(0, description="The number of items to skip")
    limit: int = Field(10, description="The number of items to return")
