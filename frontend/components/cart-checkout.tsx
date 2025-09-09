"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  CreditCard,
  Truck,
  MapPin,
  Gift,
  Shield,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const mockCartItems = [
  {
    id: "1",
    product: "Amul Fresh Milk 1L",
    platform: "BigBasket",
    price: 56,
    originalPrice: 60,
    image: "/placeholder.svg?key=milk1",
    quantity: 1,
  },
  {
    id: "3",
    product: "Britannia Bread 400g",
    platform: "Flipkart",
    price: 25,
    originalPrice: 30,
    image: "/placeholder.svg?key=bread1",
    quantity: 1,
  },
  {
    id: "5",
    product: "Farm Fresh Eggs 12pcs",
    platform: "Amazon Fresh",
    price: 84,
    originalPrice: 90,
    image: "/placeholder.svg?key=eggs1",
    quantity: 1,
  },
];

export function CartCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = mockCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const savings = mockCartItems.reduce((total, item) => {
    if (item.originalPrice) {
      return total + (item.originalPrice - item.price) * item.quantity;
    }
    return total;
  }, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);

    // Simulate API call to POST /order/create/
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setOrderComplete(true);
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold font-sans text-primary">
                Order Confirmed!
              </h1>
              <p className="text-xl text-muted-foreground">
                Your grocery order has been placed successfully
              </p>
            </div>

            <Card className="glass-strong p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">#SG-2024-001</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Estimated Delivery
                  </span>
                  <span className="text-primary font-medium">2-4 hours</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Track Order
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 glass border-0 bg-transparent"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/comparison"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comparison
          </Link>
          <h1 className="text-3xl font-bold font-sans">Secure Checkout</h1>
          <p className="text-muted-foreground">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="glass border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="glass border-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    className="glass border-0"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      className="glass border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      className="glass border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
                      className="glass border-0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="glass-strong">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="glass border-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="glass border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="glass border-0"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="glass-strong sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.product}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.product}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.platform}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{item.price}</p>
                        {item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{item.originalPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Savings */}
                {savings > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Total Savings</span>
                    </div>
                    <span className="font-bold text-primary">₹{savings}</span>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">
                      Express Delivery
                    </span>
                  </div>
                  <Badge variant="secondary" className="glass">
                    Free
                  </Badge>
                </div>

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary">Free</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{subtotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Secure Checkout
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
