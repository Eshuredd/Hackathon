from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, List
from .config import settings
from .agents import DealScoutAgent, CartBuilderAgent, OrderExecutorAgent, MockProvider

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

from .celery_app import celery_app


def _default_providers():
    return [
        MockProvider("amazon_fresh", base_price_multiplier=1.00, delivery_fee=0, eta_minutes=90),
        MockProvider("instacart", base_price_multiplier=1.02, delivery_fee=35, eta_minutes=120),
        MockProvider("uber_eats", base_price_multiplier=1.08, delivery_fee=25, eta_minutes=30),
    ]


@celery_app.task(name="aggregate_prices")
def aggregate_prices_task(items: List[Dict[str, str]], location_pin: str | None = None) -> Dict[str, Any]:
    scout = DealScoutAgent(_default_providers())
    # Convert items to GroceryItem-like dicts expected by schemas in HTTP layer; here pass-through
    from .schemas.groceries import PriceQuery

    pq = PriceQuery(items=items, location_pin=location_pin)  # pydantic will coerce
    res = scout.aggregate_prices(pq)
    return res.model_dump()


@celery_app.task(name="build_cart")
def build_cart_task(price_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    builder = CartBuilderAgent()
    from .schemas.groceries import ProviderPrice

    prices = [ProviderPrice(**pi) for pi in price_items]
    plan = builder.build_cart(prices)
    return plan.model_dump()


@celery_app.task(name="checkout")
def checkout_task(req: Dict[str, Any]) -> Dict[str, Any]:
    executor = OrderExecutorAgent()
    from .schemas.groceries import CheckoutRequest

    parsed = CheckoutRequest(**req)
    out = executor.checkout(parsed)
    return out.model_dump()
