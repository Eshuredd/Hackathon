from __future__ import annotations

from typing import List, Dict, Any
from datetime import datetime
from ..schemas.groceries import ProviderPrice, CheckoutRequest, CheckoutResponse
from ..security.rbac import check_grocery_delegation


class OrderExecutorAgent:
    def __init__(self):
        # User preference learning storage (in production, this would be in a database)
        self.user_preferences = {}  # user_id -> {provider_preferences, item_preferences, delivery_preferences}
        self.coupon_database = {
            "WELCOME20": {"discount": 0.20, "min_order": 100, "max_discount": 50},
            "FRESH15": {"discount": 0.15, "min_order": 200, "max_discount": 75},
            "BULK25": {"discount": 0.25, "min_order": 500, "max_discount": 150},
            "INSTANT10": {"discount": 0.10, "min_order": 50, "max_discount": 25},
        }
        self.loyalty_points_rate = 0.01  # 1 point per 1 INR spent

    def _authenticate_user(self, user_id: str, payment_token: str) -> bool:
        """Simulate secure user authentication"""
        # In production: validate JWT token, check user session, verify payment token
        return True  # Mock successful authentication

    def _apply_coupons(self, subtotal: float, coupon_codes: List[str]) -> Dict[str, Any]:
        """Apply valid coupon codes and calculate discounts"""
        total_discount = 0.0
        applied_coupons = []
        invalid_coupons = []

        for code in coupon_codes:
            if code.upper() in self.coupon_database:
                coupon = self.coupon_database[code.upper()]
                if subtotal >= coupon["min_order"]:
                    discount = min(subtotal * coupon["discount"], coupon["max_discount"])
                    total_discount += discount
                    applied_coupons.append({
                        "code": code.upper(),
                        "discount": discount,
                        "type": "percentage"
                    })
                else:
                    invalid_coupons.append(f"{code}: Minimum order {coupon['min_order']} required")
            else:
                invalid_coupons.append(f"{code}: Invalid coupon code")

        return {
            "total_discount": total_discount,
            "applied_coupons": applied_coupons,
            "invalid_coupons": invalid_coupons
        }

    def _apply_loyalty_points(self, user_id: str, subtotal: float) -> Dict[str, Any]:
        """Apply user's loyalty points to the order"""
        # Mock loyalty points - in production, fetch from user's account
        available_points = 500  # Mock value
        points_to_use = min(available_points, int(subtotal * 0.1))  # Use up to 10% of order value
        discount = points_to_use * self.loyalty_points_rate

        return {
            "points_used": points_to_use,
            "discount": discount,
            "remaining_points": available_points - points_to_use
        }

    def _learn_user_preferences(self, user_id: str, order_data: Dict[str, Any]):
        """Learn and update user preferences based on order patterns"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                "provider_preferences": {},
                "item_preferences": {},
                "delivery_preferences": {}
            }

        # Learn provider preference based on order frequency and value
        provider = order_data.get("provider", "unknown")
        if provider not in self.user_preferences[user_id]["provider_preferences"]:
            self.user_preferences[user_id]["provider_preferences"][provider] = {
                "order_count": 0,
                "total_value": 0.0,
                "avg_order_value": 0.0
            }

        pref = self.user_preferences[user_id]["provider_preferences"][provider]
        pref["order_count"] += 1
        pref["total_value"] += order_data.get("subtotal", 0.0)
        pref["avg_order_value"] = pref["total_value"] / pref["order_count"]

        # Learn delivery preference based on order timing
        delivery_time = order_data.get("delivery_eta_minutes", 0)
        if delivery_time <= 30:
            delivery_type = "instant"
        elif delivery_time <= 120:
            delivery_type = "fast"
        else:
            delivery_type = "standard"

        if delivery_type not in self.user_preferences[user_id]["delivery_preferences"]:
            self.user_preferences[user_id]["delivery_preferences"][delivery_type] = 0
        self.user_preferences[user_id]["delivery_preferences"][delivery_type] += 1

    def _generate_invoice(self, order_id: str, order_data: Dict[str, Any]) -> str:
        """Generate invoice details for the order"""
        invoice = f"""
        INVOICE
        Order ID: {order_id}
        Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}
        
        Items: {len(order_data.get('items', []))}
        Subtotal: ₹{order_data.get('subtotal', 0):.2f}
        Delivery Fee: ₹{order_data.get('delivery_fee', 0):.2f}
        Coupon Discount: ₹{order_data.get('coupon_discount', 0):.2f}
        Loyalty Discount: ₹{order_data.get('loyalty_discount', 0):.2f}
        Total: ₹{order_data.get('final_total', 0):.2f}
        
        Delivery ETA: {order_data.get('delivery_eta_minutes', 0)} minutes
        """
        return invoice

    def _generate_tracking_url(self, order_id: str, provider: str) -> str:
        """Generate tracking URL for the order"""
        # Mock tracking URLs - in production, these would be real tracking endpoints
        tracking_urls = {
            "amazon_fresh": f"https://amazon.in/track/{order_id}",
            "flipkart_supermart": f"https://flipkart.com/track/{order_id}",
            "bigbasket": f"https://bigbasket.com/track/{order_id}",
            "blinkit": f"https://blinkit.com/track/{order_id}",
            "swiggy_instamart": f"https://swiggy.com/track/{order_id}",
            "mixed": f"https://grocery-scout.com/track/{order_id}"
        }
        return tracking_urls.get(provider, f"https://grocery-scout.com/track/{order_id}")

    def _get_user_recommendations(self, user_id: str) -> List[str]:
        """Get personalized recommendations based on user preferences"""
        if user_id not in self.user_preferences:
            return ["Start shopping to get personalized recommendations!"]

        recommendations = []
        prefs = self.user_preferences[user_id]

        # Provider recommendations
        if prefs.get("provider_preferences"):
            top_provider = max(prefs["provider_preferences"].items(), 
                             key=lambda x: x[1]["order_count"])
            recommendations.append(f"Your favorite platform is {top_provider[0].replace('_', ' ').title()}")

        # Delivery recommendations
        if prefs.get("delivery_preferences"):
            preferred_delivery = max(prefs["delivery_preferences"].items(), key=lambda x: x[1])
            if preferred_delivery[0] == "instant":
                recommendations.append("You prefer instant delivery - try Blinkit or Swiggy Instamart for urgent items")
            elif preferred_delivery[0] == "fast":
                recommendations.append("You prefer fast delivery - Amazon Fresh and BigBasket are great options")
            else:
                recommendations.append("You prefer standard delivery - consider bulk orders for better value")

        return recommendations

    def checkout(self, req: CheckoutRequest, user_role: str = "shopper") -> CheckoutResponse:
        """Execute the grocery order with secure authentication and preference learning"""
        # Simulate secure authentication
        if not self._authenticate_user(req.payment_token_id or "mock_user", req.payment_token_id or "mock_token"):
            return CheckoutResponse(
                success=False, 
                message="Authentication failed. Please login again."
            )

        if not req.items:
            return CheckoutResponse(success=False, message="No items to checkout")

        # Check delegation requirements based on order value
        subtotal = sum(item.unit_price for item in req.items)
        required_role = check_grocery_delegation(subtotal, user_role)
        
        if required_role and required_role != user_role:
            return CheckoutResponse(
                success=False,
                message=f"Order value ₹{subtotal:.2f} requires {required_role} approval. Current role: {user_role}"
            )

        # Calculate order totals
        subtotal = sum(item.unit_price for item in req.items)
        delivery_fee = max((item.delivery_fee for item in req.items), default=0.0)
        
        # Apply coupons and loyalty points
        coupon_result = self._apply_coupons(subtotal, req.coupon_codes or [])
        loyalty_result = self._apply_loyalty_points(req.payment_token_id or "mock_user", subtotal)
        
        # Calculate final total
        final_total = subtotal + delivery_fee - coupon_result["total_discount"] - loyalty_result["discount"]
        
        # Generate order details
        order_id = f"order_{datetime.utcnow().timestamp():.0f}"
        delivery_eta = min((item.delivery_eta_minutes or 60 for item in req.items), default=60)
        
        order_data = {
            "order_id": order_id,
            "provider": req.provider,
            "subtotal": subtotal,
            "delivery_fee": delivery_fee,
            "coupon_discount": coupon_result["total_discount"],
            "loyalty_discount": loyalty_result["discount"],
            "final_total": final_total,
            "delivery_eta_minutes": delivery_eta,
            "items": req.items
        }

        # Learn user preferences
        self._learn_user_preferences(req.payment_token_id or "mock_user", order_data)
        
        # Generate invoice and tracking
        invoice = self._generate_invoice(order_id, order_data)
        tracking_url = self._generate_tracking_url(order_id, req.provider)
        
        # Get personalized recommendations
        recommendations = self._get_user_recommendations(req.payment_token_id or "mock_user")
        
        return CheckoutResponse(
            success=True,
            order_id=order_id,
            message=f"Order placed successfully on {req.provider}! {', '.join(recommendations[:2])}",
            eta_minutes=delivery_eta,
            tracking_url=tracking_url,
            invoice=invoice,
            applied_coupons=coupon_result["applied_coupons"],
            loyalty_points_used=loyalty_result["points_used"],
            final_total=final_total
        )

    def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get current user preferences for analysis"""
        return self.user_preferences.get(user_id, {})

    def get_recommendations(self, user_id: str) -> List[str]:
        """Get personalized recommendations for the user"""
        return self._get_user_recommendations(user_id)
