"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { RecentSearches } from "@/components/recent-searches";
import { FeaturedDeals } from "@/components/featured-deals";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  X,
  Store,
} from "lucide-react";
import { cartParseAdd, cartGet } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nlText, setNlText] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [adding, setAdding] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [addedItems, setAddedItems] = useState<any[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Navigate to comparison results
    window.location.href = `/comparison?q=${encodeURIComponent(query)}`;
  };

  const refreshCartBar = async () => {
    try {
      const backend = await cartGet();
      const items = backend.items || [];
      const qty = items.reduce((a: number, b: any) => a + (b.qty || 1), 0);
      setCartCount(qty);
      setCartTotal(Number(backend.total || 0));
    } catch {}
  };

  useEffect(() => {
    refreshCartBar();
  }, []);

  const handleParseAdd = async () => {
    if (!nlText.trim()) return;
    try {
      setAdding(true);
      const res = await cartParseAdd(nlText.trim());

      // Extract added items and platforms from response
      const items = res.added_items || [];
      const platforms = res.available_platforms || [];

      // Show popups for unavailable items/platforms if returned by backend
      const unavailableItems: string[] = res.unavailable_items || [];
      const unavailablePlatforms: string[] = res.unavailable_platforms || [];
      if (unavailableItems.length > 0) {
        toast({
          title: "Item not available",
          description: unavailableItems.join(", ") + " not available",
        });
      }
      if (unavailablePlatforms.length > 0) {
        toast({
          title: "Platform not available",
          description: unavailablePlatforms.join(", ") + " not available",
        });
      }

      // Show success popup with added items and platforms
      if (items.length > 0) {
        setAddedItems(items);
        setAvailablePlatforms(platforms);
        setShowSuccessPopup(true);

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 5000);
      }

      setNlText("");
      await refreshCartBar();
    } catch (e) {
      console.error("cartParseAdd failed", e);
      alert("Couldn't add items. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Smart Price Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-sans">
            What's on your grocery list today?
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Enter your items and we'll find the best prices across all platforms
          </p>
        </section>

        {/* Search Section */}
        <section className="max-w-2xl mx-auto space-y-3">
          <SearchBar onSearch={handleSearch} />
          {/* Natural language to cart */}
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 text-base rounded-md border bg-background"
              placeholder="e.g., 5 kg of rice and 2 liters of milk from instamart"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleParseAdd();
                }
              }}
            />
            <button
              type="button"
              className="px-6 py-3 text-base rounded-md bg-primary text-primary-foreground"
              onClick={handleParseAdd}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </section>

        {/* Available Platforms */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Available Platforms</h2>
            <p className="text-muted-foreground text-base">
              Compare prices across all supported grocery delivery platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amazon Fresh */}
            <Card className="glass p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Amazon Fresh</h3>
                  <p className="text-sm text-muted-foreground">
                    Premium groceries
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">Free above ₹200</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Time:</span>
                  <span className="font-medium">30-120 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Best For:</span>
                  <span className="font-medium">Packaged goods, staples</span>
                </div>
              </div>
            </Card>

            {/* Instacart */}
            <Card className="glass p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Instacart</h3>
                  <p className="text-sm text-muted-foreground">
                    Fresh groceries
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">₹35</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Time:</span>
                  <span className="font-medium">60-180 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Best For:</span>
                  <span className="font-medium">Fresh vegetables, fruits</span>
                </div>
              </div>
            </Card>

            {/* Uber Eats */}
            <Card className="glass p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Uber Eats</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick delivery
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">₹25</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Time:</span>
                  <span className="font-medium">15-45 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Best For:</span>
                  <span className="font-medium">Quick essentials</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="glass text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Average Savings</h3>
            <p className="text-3xl font-bold text-primary">₹247</p>
            <p className="text-base text-muted-foreground">per shopping trip</p>
          </Card>

          <Card className="glass text-center p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-xl mb-2">Time Saved</h3>
            <p className="text-3xl font-bold text-accent">45 min</p>
            <p className="text-base text-muted-foreground">per week</p>
          </Card>

          <Card className="glass text-center p-6">
            <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-bold text-xl mb-2">Orders Completed</h3>
            <p className="text-3xl font-bold text-foreground">12</p>
            <p className="text-base text-muted-foreground">this month</p>
          </Card>
        </section>

        {/* Recent Searches */}
        <RecentSearches />

        {/* Featured Deals */}
        <FeaturedDeals />
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 max-w-md mx-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-lg">Items Added to Cart!</h3>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Added Items */}
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                Added Items:
              </h4>
              <div className="space-y-1">
                {addedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="capitalize">{item.name}</span>
                    <span className="text-gray-500">
                      ({item.quantity} {item.unit})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Platforms */}
            {availablePlatforms.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Available on:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availablePlatforms.map((platform, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      <Store className="w-3 h-3" />
                      <span className="capitalize">
                        {platform.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-medium text-base">
                {cartCount} items in cart
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-primary text-lg">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              className="px-6 py-3 text-base rounded-md bg-primary text-primary-foreground"
              onClick={() => (window.location.href = "/cart")}
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
