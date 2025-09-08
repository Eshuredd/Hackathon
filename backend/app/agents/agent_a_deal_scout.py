from __future__ import annotations

from typing import List, Dict, Protocol, Iterable, Any
from datetime import datetime
from dataclasses import dataclass
import random
import hashlib
import json


from openai import AsyncOpenAI

from ..schemas.groceries import (
    GroceryItem,
    ProviderPrice,
    PriceQuery,
    PriceResult,
    PriceResultItem,
    PlatformPrice,
)
from ..config import settings

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.openai_api_key)


class ProviderAdapter(Protocol):
    def name(self) -> str: ...
    def search(self, query: GroceryItem, location_pin: str | None) -> ProviderPrice | None: ...


# Comprehensive mock price database for Indian grocery items
MOCK_PRICE_DATABASE = {
    # Staple Foods
    "rice": {"base_price": 45, "category": "staples", "unit": "kg"},
    "wheat flour": {"base_price": 35, "category": "staples", "unit": "kg"},
    "dal": {"base_price": 120, "category": "staples", "unit": "kg"},
    "sugar": {"base_price": 42, "category": "staples", "unit": "kg"},
    "salt": {"base_price": 20, "category": "staples", "unit": "kg"},
    "oil": {"base_price": 140, "category": "staples", "unit": "liter"},
    
    # Dairy Products
    "milk": {"base_price": 60, "category": "dairy", "unit": "liter"},
    "curd": {"base_price": 45, "category": "dairy", "unit": "kg"},
    "butter": {"base_price": 55, "category": "dairy", "unit": "100g"},
    "cheese": {"base_price": 200, "category": "dairy", "unit": "200g"},
    "paneer": {"base_price": 300, "category": "dairy", "unit": "250g"},
    
    # Vegetables
    "tomato": {"base_price": 40, "category": "vegetables", "unit": "kg"},
    "onion": {"base_price": 30, "category": "vegetables", "unit": "kg"},
    "potato": {"base_price": 25, "category": "vegetables", "unit": "kg"},
    "carrot": {"base_price": 50, "category": "vegetables", "unit": "kg"},
    "cabbage": {"base_price": 35, "category": "vegetables", "unit": "kg"},
    "spinach": {"base_price": 20, "category": "vegetables", "unit": "bunch"},
    "coriander": {"base_price": 15, "category": "vegetables", "unit": "bunch"},
    
    # Fruits
    "banana": {"base_price": 60, "category": "fruits", "unit": "dozen"},
    "apple": {"base_price": 180, "category": "fruits", "unit": "kg"},
    "orange": {"base_price": 80, "category": "fruits", "unit": "kg"},
    "mango": {"base_price": 120, "category": "fruits", "unit": "kg"},
    "grapes": {"base_price": 150, "category": "fruits", "unit": "kg"},
    
    # Spices & Condiments
    "turmeric": {"base_price": 200, "category": "spices", "unit": "100g"},
    "cumin": {"base_price": 300, "category": "spices", "unit": "100g"},
    "coriander powder": {"base_price": 150, "category": "spices", "unit": "100g"},
    "garam masala": {"base_price": 180, "category": "spices", "unit": "100g"},
    "chili powder": {"base_price": 120, "category": "spices", "unit": "100g"},
    
    # Beverages
    "tea": {"base_price": 200, "category": "beverages", "unit": "250g"},
    "coffee": {"base_price": 300, "category": "beverages", "unit": "200g"},
    "soft drink": {"base_price": 35, "category": "beverages", "unit": "500ml"},
    "juice": {"base_price": 80, "category": "beverages", "unit": "1L"},
    
    # Snacks & Ready to Eat
    "biscuits": {"base_price": 25, "category": "snacks", "unit": "100g"},
    "chips": {"base_price": 20, "category": "snacks", "unit": "50g"},
    "bread": {"base_price": 30, "category": "bakery", "unit": "loaf"},
    "eggs": {"base_price": 60, "category": "dairy", "unit": "dozen"},
    
    # Frozen & Packaged
    "frozen peas": {"base_price": 80, "category": "frozen", "unit": "500g"},
    "pasta": {"base_price": 60, "category": "packaged", "unit": "500g"},
    "noodles": {"base_price": 15, "category": "packaged", "unit": "packet"},
}

# Platform-specific pricing strategies with category-based multipliers
PLATFORM_STRATEGIES = {
    "amazon_fresh": {
        "base_multiplier": 1.0,  # Premium pricing
        "category_multipliers": {
            "staples": 0.95,      # Competitive on staples
            "dairy": 1.05,        # Premium on dairy
            "vegetables": 1.1,    # Higher on fresh vegetables
            "fruits": 1.15,       # Premium on fruits
            "spices": 0.9,        # Competitive on spices
            "beverages": 1.0,     # Standard on beverages
            "snacks": 1.1,        # Premium on snacks
            "bakery": 1.05,       # Slightly premium on bakery
            "frozen": 0.95,       # Competitive on frozen
            "packaged": 0.9,      # Very competitive on packaged
            "general": 1.0        # Default multiplier
        },
        "delivery_fee": 0,  # Free delivery above ₹200
        "min_order": 200,
        "eta_min": 30,
        "eta_max": 120,
        "discount_range": (5, 15),  # 5-15% discounts
        "premium_brands": True,
        "strengths": ["packaged", "staples", "spices"],  # Categories where they excel
    },
    "instacart": {
        "base_multiplier": 1.02,  # Slightly premium pricing
        "category_multipliers": {
            "staples": 0.98,      # Competitive on staples
            "dairy": 1.08,        # Premium on dairy
            "vegetables": 1.12,   # Higher on fresh vegetables
            "fruits": 1.18,       # Premium on fruits
            "spices": 0.95,       # Competitive on spices
            "beverages": 1.05,    # Slightly premium on beverages
            "snacks": 1.1,        # Premium on snacks
            "bakery": 1.08,       # Premium on bakery
            "frozen": 1.0,        # Standard on frozen
            "packaged": 0.95,     # Competitive on packaged
            "general": 1.02       # Default multiplier
        },
        "delivery_fee": 35,
        "min_order": 100,
        "eta_min": 60,
        "eta_max": 180,
        "discount_range": (8, 18),  # 8-18% discounts
        "premium_brands": True,
        "strengths": ["vegetables", "fruits", "dairy", "bakery"],  # Fresh items focus
    },
    "uber_eats": {
        "base_multiplier": 1.08,  # Higher prices for convenience
        "category_multipliers": {
            "staples": 1.1,       # Higher on staples (convenience premium)
            "dairy": 1.15,        # Premium on dairy (freshness premium)
            "vegetables": 1.2,    # High premium on vegetables (freshness premium)
            "fruits": 1.25,       # High premium on fruits (freshness premium)
            "spices": 1.1,        # Higher on spices
            "beverages": 1.08,    # Higher on beverages
            "snacks": 1.05,       # Slightly higher on snacks
            "bakery": 1.12,       # Higher on bakery (freshness premium)
            "frozen": 1.05,       # Slightly higher on frozen
            "packaged": 1.08,     # Higher on packaged
            "general": 1.08       # Default multiplier
        },
        "delivery_fee": 25,
        "min_order": 50,
        "eta_min": 15,
        "eta_max": 45,
        "discount_range": (5, 12),  # 5-12% discounts
        "premium_brands": False,
        "strengths": ["vegetables", "fruits", "dairy", "bakery"],  # Fresh items
    },
}

async def GroceryTextParser(grocery_text: str) -> Dict[str, Any]:
    """
    AI-powered grocery text parser to extract quantities, units, and item names.

    This function uses GPT-4o-mini to parse free-text like
    "1kg of rice and 2 liters of milk" into structured items.

    Args:
        grocery_text (str): Free-text grocery input (e.g., "1kg rice and 2 liters milk").

    Returns:
        Dict[str, Any]:
            {
              "platform": "string | null",  # e.g., "instamart", "instacart", etc.
              "items": [
                {"name": "string", "quantity": number, "unit": "string"}
              ]
            }

    Example:
        >>> items = await GroceryTextParser("1kg rice and 2 liters milk")
        >>> print(items)
        {"platform": null, "items": [{"name": "rice", "quantity": 1, "unit": "kg"}, {"name": "milk", "quantity": 2, "unit": "liter"}]}
    """
    prompt = f"""
You are a precise parser for grocery shopping inputs.
Extract a clean, structured list of grocery items with quantity and unit from the user text.

Input: "{grocery_text}"

Rules:
- Normalize units to these forms only: kg, g, liter, ml, piece, dozen, packet, pack, bunch, loaf.
- Treat plurals as their singular normalized form for units (e.g., "liters" -> "liter", "pieces" -> "piece").
- Quantity should be an integer number. Round sensibly when decimals are present.
- Item name must be a real grocery noun, lowercase and concise (e.g., "rice", "milk").
- Never output single letters or tokens derived from unit suffixes as item names. In particular, do NOT output an item named "s" in any circumstance.
- If no quantity is provided, default to 1 and infer unit as "piece".
- If multiple items are present, return all of them.
- If the text mentions a platform/provider (e.g., "instamart", "instacart", "amazon fresh", "uber eats", "blinkit", "bigbasket"), extract it as "platform" in lowercase. Do not map or normalize brand names (e.g., keep "instamart" as-is).
- CRITICAL: When you see "X liters of Y", extract Y as the item name, not "s" or any part of "liters".
- CRITICAL: When you see "X kg of Y", extract Y as the item name.

Examples (must follow exactly):
- Input: "2 kg of rice and 3 liters of milk"
- Output: {{"platform": null, "items": [{{"name": "rice", "quantity": 2, "unit": "kg"}}, {{"name": "milk", "quantity": 3, "unit": "liter"}}]}}

- Input: "1 liter of oil and 2 pieces of bread"
- Output: {{"platform": null, "items": [{{"name": "oil", "quantity": 1, "unit": "liter"}}, {{"name": "bread", "quantity": 2, "unit": "piece"}}]}}

- Input: "5 kg rice and 3 liters milk"
- Output: {{"platform": null, "items": [{{"name": "rice", "quantity": 5, "unit": "kg"}}, {{"name": "milk", "quantity": 3, "unit": "liter"}}]}}

Respond ONLY as a strict JSON object in this schema:
{{
  "platform": "string | null",
  "items": [
    {{"name": "string", "quantity": number, "unit": "string"}}
  ]
}}
"""
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that parses grocery inputs into structured items."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    content = response.choices[0].message.content
    data = json.loads(content)
    # Ensure backward compatibility keys are present
    if "platform" not in data:
        data["platform"] = None
    if "items" not in data:
        data["items"] = []
    
    # Debug statement to show what items are being returned
    print(f"DEBUG GroceryTextParser - Input: '{grocery_text}'")
    print(f"DEBUG GroceryTextParser - Extracted items: {data['items']}")
    print(f"DEBUG GroceryTextParser - Platform: {data['platform']}")
    
    return data


@dataclass
class MockProvider:
    provider_name: str
    base_price_multiplier: float = 1.0
    delivery_fee: float = 29.0
    eta_minutes: int = 60

    def name(self) -> str:
        return self.provider_name

    def _get_base_price(self, item_name: str) -> float | None:
        """Get base price for an item from the mock database"""
        # Try exact match first
        if item_name.lower() in MOCK_PRICE_DATABASE:
            return MOCK_PRICE_DATABASE[item_name.lower()]["base_price"]
        
        # Try partial matches for common variations (require at least 3 letters)
        item_lower = item_name.lower()
        if len(item_lower) < 3:
            return None  # Don't match items with less than 3 characters
            
        for db_item, data in MOCK_PRICE_DATABASE.items():
            if (db_item in item_lower or 
                item_lower in db_item or 
                any(word in item_lower for word in db_item.split())):
                return data["base_price"]
        
        # Return None for unknown items instead of fallback pricing
        return None

    def _calculate_discount(self, item_name: str, base_price: float) -> float:
        """Calculate platform-specific discount"""
        strategy = PLATFORM_STRATEGIES.get(self.provider_name, PLATFORM_STRATEGIES["amazon_fresh"])
        min_discount, max_discount = strategy["discount_range"]
        
        # Create deterministic but varied discount based on item name
        item_hash = int(hashlib.md5(item_name.encode()).hexdigest()[:8], 16)
        discount_percent = min_discount + (item_hash % (max_discount - min_discount + 1))
        
        # Apply some randomness for realistic variation
        random.seed(item_hash)
        variation = random.uniform(0.8, 1.2)
        discount_percent *= variation
        
        return min(max_discount, max(min_discount, discount_percent))

    def _get_delivery_details(self) -> tuple[float, int]:
        """Get delivery fee and ETA for the platform"""
        strategy = PLATFORM_STRATEGIES.get(self.provider_name, PLATFORM_STRATEGIES["amazon_fresh"])
        
        # Add some randomness to delivery times
        eta_min, eta_max = strategy["eta_min"], strategy["eta_max"]
        eta = random.randint(eta_min, eta_max)
        
        return strategy["delivery_fee"], eta

    def _check_stock_availability(self, item_name: str) -> bool:
        """Simulate stock availability (95% chance of being in stock)"""
        item_hash = int(hashlib.md5(item_name.encode()).hexdigest()[:8], 16)
        random.seed(item_hash)
        return random.random() > 0.05  # 95% availability

    def _get_category_multiplier(self, item_name: str, strategy: dict) -> float:
        """Get category-specific multiplier for the item"""
        # Get item category
        item_data = MOCK_PRICE_DATABASE.get(item_name.lower(), {})
        category = item_data.get("category", "general")
        
        # Get category-specific multiplier
        category_multipliers = strategy.get("category_multipliers", {})
        category_multiplier = category_multipliers.get(category, strategy["base_multiplier"])
        
        return category_multiplier

    def search(self, query: GroceryItem, location_pin: str | None) -> ProviderPrice | None:
        # Get base price for the item
        base_price = self._get_base_price(query.name)
        
        # If item not found in database, return None
        if base_price is None:
            return None
        
        # Apply platform-specific pricing strategy
        strategy = PLATFORM_STRATEGIES.get(self.provider_name, PLATFORM_STRATEGIES["amazon_fresh"])
        
        # Get category-specific multiplier
        category_multiplier = self._get_category_multiplier(query.name, strategy)
        
        # Apply category-specific pricing
        platform_price = base_price * category_multiplier
        
        # Apply brand preference if specified
        brand_factor = 0.9 if (query.preferred_brand and len(query.preferred_brand) % 2 == 0) else 1.0
        platform_price *= brand_factor
        
        # Calculate discount
        discount_percent = self._calculate_discount(query.name, platform_price)
        discounted_price = platform_price * (1 - discount_percent / 100)
        
        # Get delivery details
        delivery_fee, eta = self._get_delivery_details()
        
        # Check stock availability
        in_stock = self._check_stock_availability(query.name)
        
        # Generate product URL (mock)
        product_url = f"https://{self.provider_name.replace('_', '')}.com/product/{query.name.replace(' ', '-')}"
        
        # Get item category for metadata
        item_data = MOCK_PRICE_DATABASE.get(query.name.lower(), {})
        category = item_data.get("category", "general")
        
        return ProviderPrice(
            provider=self.provider_name,
            item_name=query.name,
            unit_price=round(discounted_price, 2),
            currency="INR",
            in_stock=in_stock,
            delivery_fee=delivery_fee,
            delivery_eta_minutes=eta,
            url=product_url,
            metadata={
                "mock": "true",
                "original_price": round(platform_price, 2),
                "discount_percent": round(discount_percent, 1),
                "category": category,
                "category_multiplier": round(category_multiplier, 3),
                "base_multiplier": strategy["base_multiplier"],
                "min_order": strategy["min_order"],
                "platform_strategy": self.provider_name,
                "platform_strengths": strategy.get("strengths", [])
            },
        )


class DealScoutAgent:
    def __init__(self, providers: Iterable[ProviderAdapter]):
        self.providers: List[ProviderAdapter] = list(providers)

    def aggregate_prices(self, query: PriceQuery) -> PriceResult:
        # Group results by item
        item_results: Dict[str, List[ProviderPrice]] = {}
        
        for item in query.items:
            item_key = f"{item.name}_{item.quantity}_{item.unit}"
            item_results[item_key] = []
            
            for provider in self.providers:
                price = provider.search(item, query.location_pin)
                if price:
                    item_results[item_key].append(price)
        
        # Transform to frontend format
        result_items: List[PriceResultItem] = []
        total_savings = 0.0
        best_platform = ""
        platform_totals: Dict[str, float] = {}
        
        for item in query.items:
            item_key = f"{item.name}_{item.quantity}_{item.unit}"
            prices = item_results.get(item_key, [])
            
            if not prices:
                continue
                
            # Convert ProviderPrice to PlatformPrice
            platforms = []
            for price in prices:
                platform_price = PlatformPrice(
                    platform=price.provider,
                    price=price.unit_price,
                    discount=float(price.metadata.get("discount", 0)),
                    delivery_time=price.delivery_eta_minutes or 30,
                    delivery_fee=price.delivery_fee,
                    stock_available=price.in_stock
                )
                platforms.append(platform_price)
                
                # Track platform totals
                if price.provider not in platform_totals:
                    platform_totals[price.provider] = 0
                platform_totals[price.provider] += price.unit_price
            
            # Create result item
            result_item = PriceResultItem(
                name=item.name,
                category=item.category or "General",
                quantity=item.quantity or 1,
                unit=item.unit or "piece",
                platforms=platforms
            )
            result_items.append(result_item)
        
        # Find best platform (lowest total)
        if platform_totals:
            best_platform = min(platform_totals.keys(), key=lambda k: platform_totals[k])
            # Calculate total savings (simplified)
            total_savings = max(platform_totals.values()) - min(platform_totals.values())
        
        # Generate recommendations
        recommendations = [
            f"Best overall platform: {best_platform}",
            f"Total potential savings: ₹{total_savings:.2f}",
            "Consider bulk purchases for better deals"
        ]
        
        return PriceResult(
            items=result_items,
            total_savings=total_savings,
            best_platform=best_platform,
            recommendations=recommendations,
            aggregated_at=datetime.utcnow().isoformat()
        )

    def get_platform_comparison(self, query: PriceQuery) -> Dict[str, Dict]:
        """Get detailed comparison across all platforms"""
        results = self.aggregate_prices(query)
        
        # Group by platform
        platform_data = {}
        for price in results.items:
            platform = price.provider
            if platform not in platform_data:
                platform_data[platform] = {
                    "items": [],
                    "total_cost": 0,
                    "delivery_fee": price.delivery_fee,
                    "delivery_time": price.delivery_eta_minutes,
                    "total_savings": 0,
                    "in_stock_items": 0,
                    "total_items": 0
                }
            
            platform_data[platform]["items"].append(price)
            platform_data[platform]["total_cost"] += price.unit_price
            platform_data[platform]["total_items"] += 1
            
            if price.in_stock:
                platform_data[platform]["in_stock_items"] += 1
            
            # Calculate savings from original price
            original_price = price.metadata.get("original_price", price.unit_price)
            savings = original_price - price.unit_price
            platform_data[platform]["total_savings"] += savings
        
        return platform_data

    def get_best_deals(self, query: PriceQuery) -> Dict[str, List[ProviderPrice]]:
        """Get best deals for each item across platforms"""
        results = self.aggregate_prices(query)
        
        # Group by item name
        item_deals = {}
        for price in results.items:
            item_name = price.item_name
            if item_name not in item_deals:
                item_deals[item_name] = []
            item_deals[item_name].append(price)
        
        # Sort by price for each item
        for item_name in item_deals:
            item_deals[item_name].sort(key=lambda x: x.unit_price)
        
        return item_deals

    def get_recommendations(self, query: PriceQuery) -> List[str]:
        """Generate smart recommendations based on price analysis"""
        platform_data = self.get_platform_comparison(query)
        best_deals = self.get_best_deals(query)
        
        recommendations = []
        
        # Find cheapest platform overall
        cheapest_platform = min(platform_data.items(), 
                               key=lambda x: x[1]["total_cost"] + x[1]["delivery_fee"])
        recommendations.append(f"💰 Best overall value: {cheapest_platform[0].replace('_', ' ').title()} "
                             f"(₹{cheapest_platform[1]['total_cost'] + cheapest_platform[1]['delivery_fee']:.2f})")
        
        # Find fastest delivery
        fastest_platform = min(platform_data.items(), 
                              key=lambda x: x[1]["delivery_time"])
        recommendations.append(f"⚡ Fastest delivery: {fastest_platform[0].replace('_', ' ').title()} "
                             f"({fastest_platform[1]['delivery_time']} minutes)")
        
        # Check for significant savings
        max_savings = max(platform_data.items(), key=lambda x: x[1]["total_savings"])
        if max_savings[1]["total_savings"] > 50:
            recommendations.append(f"🎯 Maximum savings: {max_savings[0].replace('_', ' ').title()} "
                                 f"(₹{max_savings[1]['total_savings']:.2f} off)")
        
        # Check stock availability
        for platform, data in platform_data.items():
            stock_ratio = data["in_stock_items"] / data["total_items"]
            if stock_ratio < 0.8:
                recommendations.append(f"⚠️ Limited stock on {platform.replace('_', ' ').title()} "
                                     f"({data['in_stock_items']}/{data['total_items']} items available)")
        
        # Category-specific recommendations
        category_analysis = self._analyze_categories(query)
        for category, analysis in category_analysis.items():
            if analysis["best_platform"]:
                platform_name = analysis["best_platform"].replace('_', ' ').title()
                savings = analysis["savings_vs_avg"]
                if savings > 10:
                    recommendations.append(f"🏷️ Best for {category}: {platform_name} "
                                         f"(₹{savings:.2f} cheaper than average)")
        
        # Platform strength recommendations
        platform_strengths = self._get_platform_strengths(query)
        for platform, strength_score in platform_strengths.items():
            if strength_score > 0.7:  # High strength
                platform_name = platform.replace('_', ' ').title()
                strategy = PLATFORM_STRATEGIES.get(platform, {})
                strengths = strategy.get("strengths", [])
                if strengths:
                    strength_categories = ", ".join(strengths)
                    recommendations.append(f"⭐ {platform_name} excels in: {strength_categories}")
        
        # Suggest mixed cart if beneficial
        total_items = len(query.items)
        if total_items > 3:
            recommendations.append("🛒 Consider splitting your order across platforms for maximum savings")
        
        return recommendations

    def _analyze_categories(self, query: PriceQuery) -> Dict[str, Dict]:
        """Analyze pricing by category"""
        results = self.aggregate_prices(query)
        
        # Group by category
        category_data = {}
        for price in results.items:
            category = price.metadata.get("category", "general")
            if category not in category_data:
                category_data[category] = {
                    "prices": [],
                    "platforms": set(),
                    "total_items": 0
                }
            
            category_data[category]["prices"].append(price)
            category_data[category]["platforms"].add(price.provider)
            category_data[category]["total_items"] += 1
        
        # Analyze each category
        category_analysis = {}
        for category, data in category_data.items():
            if data["prices"]:
                # Find best platform for this category
                platform_totals = {}
                for price in data["prices"]:
                    platform = price.provider
                    if platform not in platform_totals:
                        platform_totals[platform] = 0
                    platform_totals[platform] += price.unit_price
                
                best_platform = min(platform_totals.items(), key=lambda x: x[1])[0]
                avg_price = sum(platform_totals.values()) / len(platform_totals)
                best_price = platform_totals[best_platform]
                savings = avg_price - best_price
                
                category_analysis[category] = {
                    "best_platform": best_platform,
                    "best_price": best_price,
                    "avg_price": avg_price,
                    "savings_vs_avg": savings,
                    "total_items": data["total_items"]
                }
        
        return category_analysis

    def _get_platform_strengths(self, query: PriceQuery) -> Dict[str, float]:
        """Calculate platform strength scores based on item categories"""
        results = self.aggregate_prices(query)
        
        # Get unique categories in the query
        query_categories = set()
        for item in query.items:
            item_data = MOCK_PRICE_DATABASE.get(item.name.lower(), {})
            category = item_data.get("category", "general")
            query_categories.add(category)
        
        platform_strengths = {}
        for platform, strategy in PLATFORM_STRATEGIES.items():
            platform_strengths[platform] = strategy["base_multiplier"]
            strengths = strategy.get("strengths", [])
            
            # Calculate strength score based on how many query categories match platform strengths
            matching_categories = len(query_categories.intersection(set(strengths)))
            strength_score = matching_categories / len(query_categories) if query_categories else 0
            
            platform_strengths[platform] = strength_score
        
        return platform_strengths
