# Grocery Deal Scout Backend

A smart grocery deal scouting system that monitors multiple platforms for the best deals, discounts, and delivery options.

## 🎯 Overview

This backend system features **Agent-1: Deal Scout Agent** that intelligently monitors multiple grocery platforms to find the best deals for users' grocery lists.

### Key Features

- **Multi-Platform Monitoring**: Tracks Amazon Fresh, Flipkart Supermart, BigBasket, Blinkit, Swiggy Instamart
- **Real-Time Price Comparison**: Compares prices across platforms with delivery fees and minimum orders
- **Combo Deal Detection**: Identifies special combo offers (e.g., rice + milk deals)
- **Delivery Time Optimization**: Compares delivery speeds and costs
- **Intelligent Recommendations**: Provides personalized recommendations based on savings and preferences

## 🏗️ Architecture

### Agent-1: Deal Scout Agent

The core agent responsible for:

- Monitoring multiple grocery platforms simultaneously
- Fetching real-time prices, discounts, and stock availability
- Analyzing combo deals and special offers
- Comparing delivery times and costs
- Generating intelligent recommendations

### Database Models

- **GroceryItem**: Individual grocery items with categories
- **GroceryPlatform**: Platform information (delivery times, fees, etc.)
- **GroceryDeal**: Real-time deals and prices
- **GroceryList**: User's shopping lists
- **DealAnalysis**: Analysis results and recommendations

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL (or SQLite for development)
- Redis (for Celery tasks)

### Installation

1. **Clone and setup**:

```bash
cd backend
pip install -r requirements.txt
```

2. **Environment setup**:

```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

3. **Database setup**:

```bash
# The tables will be created automatically on startup
```

4. **Run the application**:

```bash
uvicorn app.main:app --reload
```

### Test the Deal Scout Agent

Run the test script to see the agent in action:

```bash
python test_deal_scout.py
```

This will demonstrate:

- Creating a grocery list
- Scouting deals across platforms
- Analyzing combo offers
- Comparing delivery times
- Generating recommendations

## 📡 API Endpoints

### Grocery Management

- `POST /grocery/items` - Create grocery items
- `GET /grocery/items` - List grocery items (with category filter)
- `POST /grocery/lists` - Create grocery lists
- `GET /grocery/lists` - Get user's grocery lists
- `POST /grocery/lists/{id}/items` - Add items to list
- `GET /grocery/lists/{id}/items` - Get items in list

### Deal Scouting

- `POST /grocery/scout-deals` - Scout deals for a grocery list
- `GET /grocery/platforms` - Get available platforms
- `GET /grocery/deals/{item_id}` - Get deals for specific item
- `POST /grocery/check-combo` - Check for combo offers
- `POST /grocery/compare-delivery` - Compare delivery times

## 🔍 How It Works

### 1. Platform Monitoring

The agent monitors 5 major grocery platforms:

- **Amazon Fresh**: 30-120 min delivery, ₹0 fee, ₹200 min order
- **Flipkart Supermart**: 45-180 min delivery, ₹40 fee, ₹150 min order
- **BigBasket**: 60-240 min delivery, ₹30 fee, ₹100 min order
- **Blinkit**: 10-30 min delivery, ₹20 fee, ₹50 min order
- **Swiggy Instamart**: 15-45 min delivery, ₹25 fee, ₹75 min order

### 2. Deal Analysis

For each grocery list, the agent:

- Fetches real-time prices from all platforms
- Calculates total costs including delivery fees
- Identifies combo deals and special offers
- Compares delivery times and costs
- Generates personalized recommendations

### 3. Smart Logic Examples

- **Combo Detection**: "Check if rice + milk combo has an offer"
- **Delivery Comparison**: "Check if Blinkit has faster delivery vs Amazon"
- **Savings Optimization**: Find the platform with maximum savings
- **Time vs Cost Trade-off**: Balance delivery speed with total cost

## 🛠️ Development

### Adding New Platforms

To add a new grocery platform:

1. Update the `platforms` dictionary in `DealScoutAgent.__init__()`
2. Implement platform-specific data fetching in `fetch_platform_data()`
3. Add platform-specific discount logic in `_generate_discount()`

### Extending Deal Logic

The agent supports various deal types:

- **Combo Deals**: Multiple items with combined discounts
- **Flash Sales**: Time-limited offers
- **Bulk Discounts**: Quantity-based savings
- **Platform-Specific Offers**: Unique deals per platform

### Testing

```bash
# Run the test script
python test_deal_scout.py

# Run API tests
pytest tests/

# Test specific functionality
python -m pytest tests/test_deal_scout.py -v
```

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost/grocery_scout
REDIS_URL=redis://localhost:6379
API_KEY_AMAZON_FRESH=your_amazon_api_key
API_KEY_FLIPKART=your_flipkart_api_key
# ... other platform API keys
```

### Platform Configuration

Each platform can be configured with:

- Base URL for API calls
- Delivery time ranges
- Delivery fees
- Minimum order amounts
- API authentication details

## 📊 Monitoring and Analytics

The system includes comprehensive logging and analytics:

- Deal scouting events
- Platform response times
- User interaction patterns
- Savings achieved per user
- Most popular items and combos

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
