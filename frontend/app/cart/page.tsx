"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { cartGet, cartAddOrUpdate } from "@/lib/api";

type CheckoutItem = {
  id: string;
  product: string;
  platform: string;
  price: number;
  originalPrice?: number;
  deliveryFee: number;
  quantity: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const backend = await cartGet();
        const snapItems: Array<{
          id: string;
          provider: string;
          item_name: string;
          unit_price?: number;
          qty: number;
        }> = backend.items || [];
        const list: CheckoutItem[] = snapItems.map((s) => ({
          id: `${(s.item_name || "").toLowerCase()}-${s.provider}`,
          product: (s.item_name || "").toLowerCase(),
          platform: s.provider,
          price: Number(s.unit_price ?? 0),
          quantity: s.qty || 1,
          deliveryFee: 0,
        }));
        setItems(list);
        setSubtotal(Number(backend.subtotal || 0));
        setDelivery(Number(backend.delivery || 0));
      } catch (e) {
        // fallback to empty
        setItems([]);
        setSubtotal(0);
        setDelivery(0);
      }
    })();
  }, []);

  const total = subtotal + delivery;

  const updateQty = async (it: CheckoutItem, next: number) => {
    try {
      const res = await cartAddOrUpdate({
        provider: it.platform,
        item_name: (it.product || "").toLowerCase(),
        unit_price: it.price,
        delivery_fee: it.deliveryFee || 0,
        qty: next,
      });
      // refresh totals and list
      const backend = await cartGet();
      const snap = backend.items || [];
      const list: CheckoutItem[] = snap.map((s: any) => ({
        id: `${(s.item_name || "").toLowerCase()}-${s.provider}`,
        product: (s.item_name || "").toLowerCase(),
        platform: s.provider,
        price: Number(s.unit_price ?? 0),
        quantity: s.qty || 1,
        deliveryFee: 0,
      }));
      setItems(list);
      setSubtotal(Number(backend.subtotal || 0));
      setDelivery(Number(backend.delivery || 0));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 flex items-center justify-between mb-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Home
            </Button>
          </Link>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty.</p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{it.product}</div>
                      <div className="text-sm text-muted-foreground">
                        {it.platform} • Qty {it.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQty(it, Math.max(0, it.quantity - 1))
                          }
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {it.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQty(it, it.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fee</span>
                <span>₹{delivery.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-2">Secure Checkout</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
