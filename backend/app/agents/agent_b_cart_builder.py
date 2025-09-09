from __future__ import annotations

import math
from typing import List, Dict, Any
from ..schemas.groceries import ProviderPrice, CartOption, CartPlan


class CartBuilderAgent:
    def __init__(self):
        pass

    def build_cart(self, prices: List[ProviderPrice]) -> CartPlan:
        # Strategy 1: Single-provider per provider
        options: List[CartOption] = []
        by_provider: Dict[str, List[ProviderPrice]] = {}
        for p in prices:
            by_provider.setdefault(p.provider, []).append(p)

        for provider, items in by_provider.items():
            subtotal = sum(i.unit_price for i in items)
            delivery_fee = max((i.delivery_fee for i in items), default=0.0)
            eta = max((i.delivery_eta_minutes or 0 for i in items), default=0)
            options.append(
                CartOption(
                    provider=provider,
                    items=items,
                    subtotal=round(subtotal, 2),
                    delivery_fee=delivery_fee,
                    total=round(subtotal + delivery_fee, 2),
                    est_delivery_minutes=eta,
                )
            )

        # Strategy 2: Split across two cheapest providers per item (approximation)
        # Using a simple approach to show how mixed carts could work
        cheapest_by_item: Dict[str, ProviderPrice] = {}
        for p in prices:
            key = f"{p.item_name}"
            if key not in cheapest_by_item or p.unit_price < cheapest_by_item[key].unit_price:
                cheapest_by_item[key] = p

        if cheapest_by_item:
            grouped: Dict[str, List[ProviderPrice]] = {}
            for v in cheapest_by_item.values():
                grouped.setdefault(v.provider, []).append(v)
            subtotal = sum(v.unit_price for v in cheapest_by_item.values())
            # Sum distinct provider delivery fees
            delivery_fee = sum(next((x.delivery_fee for x in prices if x.provider == prov), 0.0) for prov in grouped.keys())
            eta = max((v.delivery_eta_minutes or 0 for v in cheapest_by_item.values()), default=0)
            options.append(
                CartOption(
                    provider="mixed",
                    items=list(cheapest_by_item.values()),
                    subtotal=round(subtotal, 2),
                    delivery_fee=round(delivery_fee, 2),
                    total=round(subtotal + delivery_fee, 2),
                    est_delivery_minutes=eta,
                )
            )

        # Choose best option by total, tie-breaker by ETA
        best_idx = 0
        for idx in range(1, len(options)):
            a = options[idx]
            b = options[best_idx]
            if a.total < b.total or (math.isclose(a.total, b.total) and (a.est_delivery_minutes or 0) < (b.est_delivery_minutes or 0)):
                best_idx = idx

        return CartPlan(options=options, best_option_index=best_idx)

CartItem = Dict[str, Any]  # { id, provider, item_name, unit_price, delivery_fee, qty, metadata }

_CART_STORE: Dict[str, List[CartItem]] = {}


def _ensure_user(user_id: str) -> List[CartItem]:
    if user_id not in _CART_STORE:
        _CART_STORE[user_id] = []
    return _CART_STORE[user_id]


def cart_add_or_update(user_id: str, price: ProviderPrice, qty: int = 1) -> Dict[str, Any]:
    """
    Add or update a cart line for the given user. Dedupe by (provider,item_name).
    qty <= 0 will remove the line.
    """
    cart = _ensure_user(user_id)
    line_id = f"{price.provider}:{price.item_name}"
    existing = next((c for c in cart if c["id"] == line_id), None)
    if qty <= 0:
        if existing:
            cart.remove(existing)
        return cart_summary(user_id)

    payload: CartItem = {
        "id": line_id,
        "provider": price.provider,
        "item_name": price.item_name,
        "unit_price": float(price.unit_price),
        "delivery_fee": float(price.delivery_fee or 0.0),
        "qty": int(qty),
        "metadata": price.metadata or {},
    }

    if existing:
        # Preserve existing delivery_fee if incoming payload does not specify a meaningful value
        if not payload.get("delivery_fee"):
            payload["delivery_fee"] = existing.get("delivery_fee", 0.0)
        existing.update(payload)
    else:
        cart.append(payload)
    return cart_summary(user_id)


def cart_remove(user_id: str, line_id: str) -> Dict[str, Any]:
    cart = _ensure_user(user_id)
    item = next((c for c in cart if c["id"] == line_id), None)
    if item:
        cart.remove(item)
    return cart_summary(user_id)


def cart_clear(user_id: str) -> Dict[str, Any]:
    _CART_STORE[user_id] = []
    return cart_summary(user_id)


def cart_summary(user_id: str) -> Dict[str, Any]:
    cart = _ensure_user(user_id)
    subtotal = sum(c["unit_price"] * c.get("qty", 1) for c in cart)
    # Delivery fee: one per unique provider present in cart
    unique_providers = {}
    for c in cart:
        if c["provider"] not in unique_providers:
            unique_providers[c["provider"]] = c.get("delivery_fee", 0.0)
    delivery = sum(unique_providers.values())
    total = subtotal + delivery
    return {
        "items": cart,
        "subtotal": round(subtotal, 2),
        "delivery": round(delivery, 2),
        "total": round(total, 2),
    }


def cart_get(user_id: str) -> Dict[str, Any]:
    """Return current cart for the user without modifying it."""
    return cart_summary(user_id)
