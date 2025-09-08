#!/usr/bin/env python3
"""
Example of how to import and use the GroceryTextParser function.
"""

import asyncio
from simple_grocery_test import GroceryTextParser

async def main():
    """Example usage of the imported function."""
    print("📦 Import Example: Using GroceryTextParser")
    print("=" * 50)
    
    # Test the imported function
    test_input = "1kg of rice and 2 liters of milk"
    print(f"Input: '{test_input}'")
    
    # Use the imported function
    result = await GroceryTextParser(test_input)
    print(f"Result: {result}")
    
    # Format the output nicely
    print("\n📋 Formatted Output:")
    for i, item in enumerate(result, 1):
        print(f"   {i}. {item['name'].title()}: {item['quantity']} {item['unit']}")

if __name__ == "__main__":
    asyncio.run(main())

