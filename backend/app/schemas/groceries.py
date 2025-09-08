from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class GroceryItem(BaseModel):
    name: str
    quantity: Optional[int] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    preferred_brand: Optional[str] = None


class ProviderPrice(BaseModel):
    provider: str
    item_name: str
    unit_price: float
    currency: str = "INR"
    in_stock: bool = True
    delivery_fee: float = 0.0
    delivery_eta_minutes: Optional[int] = None
    url: Optional[str] = None
    metadata: Dict[str, Any] = {}


class PriceQuery(BaseModel):
    items: List[GroceryItem]
    location_pin: Optional[str] = None


class PlatformPrice(BaseModel):
    platform: str
    price: float
    discount: float = 0.0
    delivery_time: int
    delivery_fee: float = 0.0
    stock_available: bool = True

class PriceResultItem(BaseModel):
    name: str
    category: str
    quantity: int
    unit: str
    platforms: List[PlatformPrice]

class PriceResult(BaseModel):
    items: List[PriceResultItem]
    total_savings: float
    best_platform: str
    recommendations: List[str]
    aggregated_at: str


class CartOption(BaseModel):
    provider: str
    items: List[ProviderPrice]
    subtotal: float
    delivery_fee: float
    total: float
    est_delivery_minutes: Optional[int] = None


class CartPlan(BaseModel):
    options: List[CartOption]
    best_option_index: int = Field(0, ge=0)
    notes: Optional[str] = None


class CheckoutRequest(BaseModel):
    provider: str
    items: List[ProviderPrice]
    coupon_codes: Optional[List[str]] = None
    payment_token_id: Optional[str] = None


class CheckoutResponse(BaseModel):
    success: bool
    order_id: Optional[str] = None
    message: Optional[str] = None
    eta_minutes: Optional[int] = None
    tracking_url: Optional[str] = None
    invoice: Optional[str] = None
    applied_coupons: Optional[List[Dict[str, Any]]] = None
    loyalty_points_used: Optional[int] = None
    final_total: Optional[float] = None

