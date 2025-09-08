from typing import Dict, List, Optional

ROLE_SCOPES: Dict[str, List[str]] = {
    "viewer": [
        "audit.read",
    ],
    "shopper": [
        "groceries.search",
        "groceries.cart",
        "groceries.checkout",
        "groceries.workflow",
        "groceries.analytics",
        "groceries.health",
    ],
    "admin": [
        "audit.read",
        "admin.manage",
        "groceries.search",
        "groceries.cart",
        "groceries.checkout",
        "groceries.workflow",
        "groceries.analytics",
        "groceries.health",
        "groceries.admin",
    ],
}

# Grocery-specific delegation for high-value orders
GROCERY_DELEGATION: Dict[str, Dict[str, Optional[str] or float]] = {
    "shopper": {"max_value": 1000.0, "delegates_to": "admin"},
    "admin": {"max_value": float("inf"), "delegates_to": None},
}


def check_grocery_delegation(order_value: float, user_role: str) -> Optional[str]:
    """Check if grocery order requires delegation based on value"""
    if user_role not in GROCERY_DELEGATION:
        return None
    limit = GROCERY_DELEGATION[user_role]["max_value"]  # type: ignore[index]
    if order_value > float(limit):
        return GROCERY_DELEGATION[user_role]["delegates_to"]  # type: ignore[index]
    return None
