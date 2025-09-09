from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends

from ..security.dependencies import require_scopes, get_user_id, get_optional_user_id
from ..schemas.groceries import PriceQuery, PriceResult, CartPlan, CheckoutRequest, CheckoutResponse, GroceryItem
from ..agents import DealScoutAgent, CartBuilderAgent, OrderExecutorAgent, OverseerAgent, MockProvider
from ..agents.agent_b_cart_builder import (
    cart_add_or_update,
    cart_get,
    cart_remove,
    cart_clear,
)
from ..agents.agent_a_deal_scout import GroceryTextParser
import re
from fastapi import Request

router = APIRouter()


def build_default_providers():
    """Build providers with realistic platform configurations"""
    return [
        MockProvider("amazon_fresh"),
        MockProvider("instacart"),
        MockProvider("uber_eats"),
    ]


@router.post("/prices", response_model=PriceResult)
async def aggregate_prices(body: PriceQuery) -> PriceResult:
    scout = DealScoutAgent(build_default_providers())
    return scout.aggregate_prices(body)


# ----------------------------- CART ROUTER -----------------------------
# Session-scoped simple cart using signed cookies (for demo). For production,
# store in DB keyed by user_id and/or cart_id.

def _get_cart(request: Request) -> dict:
    return request.session.setdefault("cart", {})  # { item_id: {qty, platform, price, delivery_fee} }


@router.get("/cart")
async def get_cart(request: Request, user_id: str = Depends(get_optional_user_id)):
    return cart_get(user_id)


@router.post("/cart/items")
async def add_or_update_cart_item(request: Request, payload: dict, user_id: str = Depends(get_optional_user_id)):
    """
    payload: { id, product, platform, price, delivery_fee, qty }
    """
    # Minimal payload required: provider/item_name/unit_price/delivery_fee
    price_like = type("P", (), {})()
    setattr(price_like, "provider", payload.get("provider") or payload.get("platform"))
    setattr(price_like, "item_name", payload.get("item_name") or payload.get("product"))
    setattr(price_like, "unit_price", float(payload.get("unit_price") or payload.get("price", 0)))
    setattr(price_like, "delivery_fee", float(payload.get("delivery_fee", 0)))
    setattr(price_like, "delivery_eta_minutes", None)
    setattr(price_like, "metadata", payload.get("metadata") or {})
    qty = int(payload.get("qty", 1))
    return cart_add_or_update(user_id, price_like, qty)


@router.delete("/cart/items/{item_id}")
async def delete_cart_item(item_id: str, request: Request, user_id: str = Depends(get_optional_user_id)):
    return cart_remove(user_id, item_id)


@router.delete("/cart")
async def clear_cart(request: Request, user_id: str = Depends(get_optional_user_id)):
    return cart_clear(user_id)


@router.post("/cart/parse-add")
async def parse_and_add_to_cart(payload: dict, request: Request, user_id: str = Depends(get_optional_user_id)):
    """
    Payload: { "text": "5 kg of rice and 2 liters of milk from instamart" }
    Uses GroceryTextParser to extract structured items and adds them to the global cart.
    Provider is inferred from text if present (e.g., 'from instamart'), else defaults to 'instacart'.
    """
    text = payload.get("text", "")
    if not text:
        return {"items": [], "subtotal": 0, "delivery": 0, "total": 0}

    # Infer provider from text in a very simple way (default if none found)
    provider = "instacart"
    lower = text.lower()
    for p in ["instacart", "amazon_fresh", "uber_eats", "bigbasket", "instamart", "blinkit"]:
        if p in lower:
            provider = p
            break

    try:
        parsed = await GroceryTextParser(text)
        # Support both new shape { platform, items } and legacy [items]
        if isinstance(parsed, dict):
            platform = parsed.get("platform")
            if platform:
                provider = platform.lower()
            items = parsed.get("items", [])
        else:
            items = parsed or []
    except Exception as e:
        # Fallback: simple regex-based parser
        items = []
        # normalize separators
        tmp = re.sub(r" and ", ",", lower)
        # patterns like '5 kg of rice', '2 liters milk'
        pat = re.compile(r"(\d+)\s*(kg|kilograms|g|grams|liter|liters|l|ml|piece|pieces|pcs)?\s*(?:of\s+)?([a-zA-Z_]+)")
        for m in pat.finditer(tmp):
            qty = int(m.group(1))
            unit = (m.group(2) or "piece").lower()
            name = (m.group(3) or "").lower()
            if name:
                items.append({"name": name, "quantity": qty, "unit": unit})
    # Lists to track unavailability for UX popups
    unavailable_items: list[str] = []
    unavailable_platforms: list[str] = []

    # Each item: {name, quantity, unit}
    for it in items:
        name = it.get("name") or ""
        qty = int(it.get("quantity") or 1)
        if not name:
            continue
        # Determine canonical provider id used by our pricing engine
        canonical_provider = provider
        if canonical_provider == "instamart":
            canonical_provider = "instacart"

        # Try to look up a realistic price and delivery fee using DealScoutAgent
        unit_price = 0.0
        delivery_fee = 0.0
        found_any_platform = False
        found_selected_platform = False
        try:
            scout = DealScoutAgent(build_default_providers())
            grocery_item = GroceryItem(name=name, quantity=qty, unit=(it.get("unit") or "piece"), category="general")
            q = PriceQuery(items=[grocery_item])
            res = scout.aggregate_prices(q)
            if res.items:
                platforms = res.items[0].platforms
                found_any_platform = len(platforms) > 0
                for plat in platforms:
                    if plat.platform == canonical_provider:
                        unit_price = float(plat.price)
                        delivery_fee = float(plat.delivery_fee or 0.0)
                        found_selected_platform = True
                        break
        except Exception as e:
            pass

        # Determine availability and decide whether to add to cart
        if not found_any_platform:
            unavailable_items.append(name)
            continue
        if not found_selected_platform:
            unavailable_platforms.append(canonical_provider)
            continue

        price_like = type("P", (), {})()
        setattr(price_like, "provider", canonical_provider)
        setattr(price_like, "item_name", name)
        setattr(price_like, "unit_price", unit_price)
        setattr(price_like, "delivery_fee", delivery_fee)
        setattr(price_like, "delivery_eta_minutes", None)
        setattr(price_like, "metadata", {"parsed": True, "unit": it.get("unit")})
        cart_add_or_update(user_id, price_like, qty)

    response = cart_get(user_id)
    response["unavailable_items"] = unavailable_items
    response["unavailable_platforms"] = list(set(unavailable_platforms))
    
    # Track which items were successfully added and what platforms are available
    added_items = []
    available_platforms = set()
    
    for it in items:
        name = it.get("name") or ""
        qty = int(it.get("quantity") or 1)
        unit = it.get("unit") or "piece"
        
        # Check if this item was successfully added (not in unavailable_items)
        if name not in unavailable_items:
            added_items.append({
                "name": name,
                "quantity": qty,
                "unit": unit
            })
            
            # Get available platforms for this item
            try:
                q = PriceQuery(items=[GroceryItem(name=name, quantity=qty, unit=unit)])
                res = scout.aggregate_prices(q)
                if res.items:
                    for platform in res.items[0].platforms:
                        available_platforms.add(platform.platform)
            except Exception:
                pass
    
    response["added_items"] = added_items
    response["available_platforms"] = list(available_platforms)
    
    return response


@router.post("/cart", response_model=CartPlan)
async def build_cart(body: PriceQuery) -> CartPlan:
    scout = DealScoutAgent(build_default_providers())
    prices = scout.aggregate_prices(body)
    builder = CartBuilderAgent()
    return builder.build_cart(prices.items)


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(req: CheckoutRequest) -> CheckoutResponse:
    executor = OrderExecutorAgent()
    return executor.checkout(req)


@router.post("/workflow")
async def execute_workflow(
    query: PriceQuery, 
    checkout_request: CheckoutRequest | None = None
):
    """
    Execute the complete grocery workflow using the Overseer Agent.
    This orchestrates all three agents: Deal Scout -> Cart Builder -> Order Executor
    """
    overseer = OverseerAgent()
    result = overseer.execute_workflow(query, checkout_request)
    return result


@router.get("/analytics")
async def get_workflow_analytics():
    """Get comprehensive workflow analytics and agent performance metrics"""
    overseer = OverseerAgent()
    return overseer.get_workflow_analytics()


@router.get("/health")
async def get_agent_health():
    """Get health status of all agents"""
    overseer = OverseerAgent()
    return overseer.get_agent_health_status()


@router.post("/compare-platforms")
async def compare_platforms(body: PriceQuery):
    """Get detailed platform comparison with pricing analysis"""
    scout = DealScoutAgent(build_default_providers())
    platform_data = scout.get_platform_comparison(body)
    return {
        "platforms": platform_data,
        "analysis_timestamp": datetime.utcnow().isoformat(),
        "total_items": len(body.items)
    }


@router.post("/best-deals")
async def get_best_deals(body: PriceQuery):
    """Get best deals for each item across all platforms"""
    scout = DealScoutAgent(build_default_providers())
    best_deals = scout.get_best_deals(body)
    return {
        "best_deals": best_deals,
        "analysis_timestamp": datetime.utcnow().isoformat()
    }


@router.post("/recommendations")
async def get_recommendations(body: PriceQuery):
    """Get smart recommendations based on price analysis"""
    scout = DealScoutAgent(build_default_providers())
    recommendations = scout.get_recommendations(body)
    return {
        "recommendations": recommendations,
        "analysis_timestamp": datetime.utcnow().isoformat()
    }


@router.get("/mock-items")
async def get_available_mock_items():
    """Get list of available mock items for testing"""
    from ..agents.agent_a_deal_scout import MOCK_PRICE_DATABASE
    return {
        "available_items": list(MOCK_PRICE_DATABASE.keys()),
        "categories": list(set(item["category"] for item in MOCK_PRICE_DATABASE.values())),
        "total_items": len(MOCK_PRICE_DATABASE)
    }


@router.get("/platform-strategies")
async def get_platform_strategies():
    """Get platform pricing strategies and category multipliers"""
    from ..agents.agent_a_deal_scout import PLATFORM_STRATEGIES
    return {
        "platforms": PLATFORM_STRATEGIES,
        "analysis_timestamp": datetime.utcnow().isoformat()
    }


@router.post("/category-analysis")
async def get_category_analysis(body: PriceQuery):
    """Get detailed category-based pricing analysis"""
    scout = DealScoutAgent(build_default_providers())
    category_analysis = scout._analyze_categories(body)
    platform_strengths = scout._get_platform_strengths(body)
    
    return {
        "category_analysis": category_analysis,
        "platform_strengths": platform_strengths,
        "analysis_timestamp": datetime.utcnow().isoformat()
    }


