"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  product: string;
  platform: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface CartSummaryProps {
  items: CartItem[];
  quantities: Record<string, number>;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  totalAmount: number;
  totalSavings: number;
  totalDelivery: number;
  onCheckout?: () => void;
}

export function CartSummary({
  items,
  quantities,
  onInc,
  onDec,
  totalAmount,
  totalSavings,
  totalDelivery,
  onCheckout,
}: CartSummaryProps) {
  if (items.length === 0) {
    return (
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Your Cart</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">
            Select items from the comparison to add them to your cart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Your Cart</span>
          </div>
          <Badge variant="secondary" className="glass">
            {Object.values(quantities).reduce((a, b) => a + b, 0) ||
              items.length}{" "}
            items
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalSavings > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">You're saving</span>
            </div>
            <span className="font-bold text-primary">
              ₹{totalSavings.toFixed(2)}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>₹{totalDelivery.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">
              ₹{(totalAmount + totalDelivery).toFixed(2)}
            </span>
          </div>
        </div>

        {onCheckout ? (
          <Button className="w-full" size="lg" onClick={onCheckout}>
            Proceed to Checkout
          </Button>
        ) : (
          <Link href="/cart">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
