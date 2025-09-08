"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Truck, Zap, Plus } from "lucide-react";

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
}

interface ComparisonTableProps {
  items: ComparisonItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string, checked: boolean) => void;
  quantities?: Record<string, number>;
  onInc?: (id: string) => void;
  onDec?: (id: string) => void;
}

export function ComparisonTable({
  items,
  selectedItems,
  onItemSelect,
  quantities = {},
  onInc,
  onDec,
}: ComparisonTableProps) {
  const getPlatformLogo = (platform: string) => {
    const logos = {
      BigBasket: "🛒",
      "Amazon Fresh": "📦",
      Flipkart: "🛍️",
    };
    return logos[platform as keyof typeof logos] || "🏪";
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      BigBasket: "bg-green-500",
      "Amazon Fresh": "bg-orange-500",
      Flipkart: "bg-blue-500",
    };
    return colors[platform as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        const qty = quantities[item.id] || (isSelected ? 1 : 0);
        return (
          <Card
            key={item.id}
            className={`glass hover:scale-[1.02] transition-all duration-200 ${
              item.isBestDeal
                ? "ring-2 ring-primary/50 shadow-lg shadow-primary/20"
                : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onItemSelect(item.id, checked as boolean)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />

                {/* Product Image */}
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.product}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  {item.isBestDeal && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        Best Deal
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{item.product}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>{item.delivery}</span>
                    </div>
                    {!item.inStock && (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Platform */}
                <div className="text-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 ${getPlatformColor(
                        item.platform
                      )} rounded-full flex items-center justify-center text-white text-sm`}
                    >
                      {getPlatformLogo(item.platform)}
                    </div>
                    <span className="font-medium">{item.platform}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  {item.discount && (
                    <Badge variant="secondary" className="glass text-xs">
                      {item.discount}
                    </Badge>
                  )}
                </div>

                {/* Add / Qty Controls */}
                {isSelected ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-0"
                      onClick={() => onDec && onDec(item.id)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">{qty}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-0"
                      onClick={() => onInc && onInc(item.id)}
                    >
                      +
                    </Button>
                    <Badge variant="secondary" className="glass">
                      Added
                    </Badge>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-0"
                    onClick={() => onItemSelect(item.id, true)}
                    disabled={!item.inStock}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
