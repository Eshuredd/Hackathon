"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { ComparisonTable } from "@/components/comparison-table";
import { CartSummary } from "@/components/cart-summary";
import { ShoppingCart, Filter, SortAsc, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  fetchComparisonRows,
  type ComparisonRow,
  cartAddOrUpdate,
  cartGet,
} from "@/lib/api";

interface ComparisonItem {
  id: string;
  product: string;
  platform: string;
  price: number;
  originalPrice?: number;
  delivery: string;
  discount?: string;
  rating: number;
  image: string;
  isBestDeal: boolean;
  inStock: boolean;
  deliveryFee?: number;
}

const STORAGE_KEY = "comparison_cart_selection";

export function ComparisonResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "Milk, Bread, Eggs";
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<ComparisonItem[]>([]);
  const [rows, setRows] = useState<ComparisonItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendCartTotals, setBackendCartTotals] = useState<{
    subtotal: number;
    delivery: number;
  }>({
    subtotal: 0,
    delivery: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data: ComparisonRow[] = await fetchComparisonRows(query);
        if (cancelled) return;
        const mapped: ComparisonItem[] = data.map((r) => ({
          id: r.id,
          product: r.product,
          platform: r.platform,
          price: r.price,
          originalPrice: r.originalPrice,
          delivery: r.delivery,
          discount: r.discount,
          rating: r.rating,
          image: r.image,
          isBestDeal: r.isBestDeal,
          inStock: r.inStock,
          deliveryFee: r.deliveryFee ?? 0,
        }));
        setRows(mapped);

        // fetch backend cart to rehydrate
        try {
          const backend = await cartGet();
          const snapItems: Array<{
            id: string;
            provider: string;
            item_name: string;
            unit_price?: number;
            qty: number;
          }> = backend.items || [];
          if (snapItems.length) {
            // Build sidebar cart from backend items (global cart)
            const sidebarList: ComparisonItem[] = snapItems.map((s) => ({
              id: `${(s.item_name || "").toLowerCase()}-${s.provider}`,
              product: (s.item_name || "").toLowerCase(),
              platform: s.provider,
              price: Number(s.unit_price ?? 0),
              originalPrice: undefined,
              delivery: "",
              discount: undefined,
              rating: 4.3,
              image: "/placeholder.svg",
              isBestDeal: false,
              inStock: true,
            }));
            const qmap: Record<string, number> = {};
            for (const s of snapItems) {
              const id = `${(s.item_name || "").toLowerCase()}-${s.provider}`;
              qmap[id] = s.qty || 1;
            }
            setCartItems(sidebarList);
            setQuantities(qmap);

            // Highlight rows on the page that exist in the backend cart
            const idsOnPage: string[] = [];
            for (const s of snapItems) {
              const sName = (s.item_name || "").toLowerCase();
              const row = mapped.find(
                (m) =>
                  (m.product || "").toLowerCase() === sName &&
                  m.platform === s.provider
              );
              if (row) idsOnPage.push(row.id);
            }
            setSelectedItems(idsOnPage);

            setBackendCartTotals({
              subtotal: backend.subtotal || 0,
              delivery: backend.delivery || 0,
            });
          } else {
            setCartItems([]);
            setQuantities({});
            setSelectedItems([]);
            setBackendCartTotals({ subtotal: 0, delivery: 0 });
          }
        } catch {}

        // Rehydrate selection from local STORAGE_KEY if present
        try {
          const raw =
            localStorage.getItem(STORAGE_KEY) ||
            sessionStorage.getItem(STORAGE_KEY);
          if (raw) {
            const saved: Record<string, number> = JSON.parse(raw);
            const ids = Object.keys(saved).filter((id) =>
              mapped.some((m) => m.id === id)
            );
            if (ids.length) {
              setSelectedItems(ids);
              setQuantities(
                ids.reduce((acc, id) => ({ ...acc, [id]: saved[id] || 1 }), {})
              );
              setCartItems(
                ids
                  .map((id) => mapped.find((m) => m.id === id)!)
                  .filter(Boolean)
              );
            }
          }
        } catch {}
      } catch (e: any) {
        setError(e?.message || "Failed to fetch prices");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Persist selection on change
  useEffect(() => {
    const snapshot: Record<string, number> = {};
    for (const id of selectedItems) snapshot[id] = quantities[id] || 1;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}
  }, [selectedItems, quantities]);

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
      const item = rows.find((i) => i.id === itemId);
      if (item) {
        setCartItems([...cartItems, item]);
        setQuantities((q) => ({ ...q, [itemId]: (q[itemId] || 0) + 1 }));
        // send to backend
        cartAddOrUpdate({
          provider: item.platform,
          item_name: (item.product || "").toLowerCase(),
          unit_price: item.price,
          delivery_fee: item.deliveryFee || 0,
          qty: 1,
        })
          .then((b) =>
            setBackendCartTotals({
              subtotal: b.subtotal || 0,
              delivery: b.delivery || 0,
            })
          )
          .catch(() => {});
      }
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      setQuantities((q) => {
        const copy = { ...q };
        delete copy[itemId];
        return copy;
      });
      const item = rows.find((i) => i.id === itemId);
      if (item) {
        cartAddOrUpdate({
          provider: item.platform,
          item_name: (item.product || "").toLowerCase(),
          unit_price: item.price,
          delivery_fee: item.deliveryFee || 0,
          qty: 0,
        })
          .then((b) =>
            setBackendCartTotals({
              subtotal: b.subtotal || 0,
              delivery: b.delivery || 0,
            })
          )
          .catch(() => {});
      }
    }
  };

  const incrementQty = (itemId: string) => {
    setQuantities((q) => ({ ...q, [itemId]: (q[itemId] || 0) + 1 }));
    const item = rows.find((i) => i.id === itemId);
    if (item) {
      cartAddOrUpdate({
        provider: item.platform,
        item_name: (item.product || "").toLowerCase(),
        unit_price: item.price,
        delivery_fee: item.deliveryFee || 0,
        qty: (quantities[itemId] || 0) + 1,
      })
        .then((b) =>
          setBackendCartTotals({
            subtotal: b.subtotal || 0,
            delivery: b.delivery || 0,
          })
        )
        .catch(() => {});
    }
  };

  const decrementQty = (itemId: string) => {
    const next = Math.max(0, (quantities[itemId] || 0) - 1);
    setQuantities((q) => ({ ...q, [itemId]: next }));
    const item =
      rows.find((i) => i.id === itemId) ||
      cartItems.find((i) => i.id === itemId);
    if (item) {
      cartAddOrUpdate({
        provider: item.platform,
        item_name: (item.product || "").toLowerCase(),
        unit_price: item.price,
        delivery_fee: item.deliveryFee || 0,
        qty: next,
      })
        .then((b) =>
          setBackendCartTotals({
            subtotal: b.subtotal || 0,
            delivery: b.delivery || 0,
          })
        )
        .catch(() => {});
    }
    if (next === 0) {
      // Remove from local lists so count reflects zero
      setCartItems((list) => list.filter((i) => i.id !== itemId));
      setSelectedItems((ids) => ids.filter((id) => id !== itemId));
      setQuantities((q) => {
        const copy = { ...q };
        delete copy[itemId];
        return copy;
      });
    }
  };

  const totalSavings = cartItems.reduce((total, item) => {
    if (item.originalPrice) {
      const qty = quantities[item.id] || 1;
      return total + qty * (item.originalPrice - item.price);
    }
    return total;
  }, 0);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * (quantities[item.id] || 1),
    0
  );

  // Prefer backend totals if available
  const sidebarSubtotal = backendCartTotals.subtotal || totalAmount;
  const sidebarDelivery = backendCartTotals.delivery;

  const uniquePlatforms = Array.from(new Set(cartItems.map((i) => i.platform)));
  const platformFeeMap: Record<string, number> = {};
  for (const it of cartItems) {
    if (it.platform && platformFeeMap[it.platform] == null) {
      platformFeeMap[it.platform] = it.deliveryFee || 0;
    }
  }
  const totalDelivery = Object.values(platformFeeMap).reduce(
    (a, b) => a + b,
    0
  );

  // Persist cart snapshot continuously so /cart can render the latest selection
  useEffect(() => {
    try {
      const itemsSnapshot = cartItems.map((it) => ({
        id: it.id,
        product: it.product,
        platform: it.platform,
        price: it.price,
        originalPrice: it.originalPrice,
        deliveryFee: it.deliveryFee || 0,
        quantity: quantities[it.id] || 1,
      }));
      const data = {
        items: itemsSnapshot,
        subtotal: totalAmount,
        delivery: totalDelivery,
        total: totalAmount + totalDelivery,
      };
      localStorage.setItem("checkout_cart", JSON.stringify(data));
    } catch {}
  }, [cartItems, quantities, totalAmount, totalDelivery]);

  const handleCheckout = () => {
    const payload = cartItems.map((it) => ({
      id: it.id,
      product: it.product,
      platform: it.platform,
      price: it.price,
      originalPrice: it.originalPrice,
      deliveryFee: it.deliveryFee || 0,
      quantity: quantities[it.id] || 1,
    }));
    try {
      const data = {
        items: payload,
        subtotal: totalAmount,
        delivery: totalDelivery,
        total: totalAmount + totalDelivery,
      };
      // Persist to both localStorage and sessionStorage (best effort)
      localStorage.setItem("checkout_cart", JSON.stringify(data));
      sessionStorage.setItem("checkout_cart", JSON.stringify(data));
    } catch {}
    window.location.href = "/cart";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Comparison Results for: {query}
            </span>
          </div>
          <h1 className="text-3xl font-bold font-sans">
            Price Comparison Results
          </h1>
          <p className="text-muted-foreground">
            We found the best deals across all platforms. Select items to add to
            your cart.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card className="glass p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-0 bg-transparent"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-0 bg-transparent"
                  >
                    <SortAsc className="w-4 h-4 mr-2" />
                    Sort by Price
                  </Button>
                </div>
                <Badge variant="secondary" className="glass">
                  {rows.length} products found
                </Badge>
              </div>
            </Card>

            {/* Comparison Table */}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading prices…</p>
            ) : (
              <ComparisonTable
                items={rows}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                quantities={quantities}
                onInc={incrementQty}
                onDec={decrementQty}
              />
            )}
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary
                items={cartItems}
                quantities={quantities}
                onInc={incrementQty}
                onDec={decrementQty}
                totalAmount={sidebarSubtotal}
                totalSavings={totalSavings}
                totalDelivery={sidebarDelivery}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {selectedItems.length} items selected
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            <Button size="lg" className="px-8">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
