from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MenuItem(BaseModel):
    original: str
    translated: str
    description: Optional[str] = None
    price: Optional[float] = None
    spicy_level: int = Field(default=0, ge=0, le=3)
    allergens: List[str] = Field(default_factory=list)
    category: str = "main"


class MenuResult(BaseModel):
    restaurant_name: Optional[str] = None
    items: List[MenuItem] = Field(default_factory=list)


class ScanResponse(BaseModel):
    id: int
    target_language: str
    raw_text: str
    result: MenuResult
    created_at: datetime


class HistoryItem(BaseModel):
    id: int
    target_language: str
    created_at: datetime
    restaurant_name: Optional[str] = None
    item_count: int


class HistoryDetail(BaseModel):
    id: int
    target_language: str
    created_at: datetime
    result: MenuResult
