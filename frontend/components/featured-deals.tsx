"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowRight, Percent } from "lucide-react"

const featuredDeals = [
  {
    id: 1,
    title: "Fresh Vegetables Bundle",
    description: "Onions, Tomatoes, Potatoes & More",
    originalPrice: "₹299",
    discountedPrice: "₹199",
    discount: "33% OFF",
    platform: "BigBasket",
    rating: 4.5,
    image: "/fresh-vegetables-bundle.jpg",
    badge: "Best Deal",
  },
  {
    id: 2,
    title: "Dairy Essentials Pack",
    description: "Milk, Butter, Cheese & Yogurt",
    originalPrice: "₹450",
    discountedPrice: "₹320",
    discount: "29% OFF",
    platform: "Amazon Fresh",
    rating: 4.7,
    image: "/placeholder-xvo05.png",
    badge: "Popular",
  },
  {
    id: 3,
    title: "Pantry Staples Combo",
    description: "Rice, Oil, Sugar & Pulses",
    originalPrice: "₹899",
    discountedPrice: "₹649",
    discount: "28% OFF",
    platform: "Flipkart",
    rating: 4.3,
    image: "/placeholder-jqv11.png",
    badge: "Limited Time",
  },
]

export function FeaturedDeals() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Percent className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold font-sans">Featured Deals</h2>
        </div>
        <Button variant="ghost" size="sm">
          View All Deals
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {featuredDeals.map((deal) => (
          <Card key={deal.id} className="glass overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <img src={deal.image || "/placeholder.svg"} alt={deal.title} className="w-full h-48 object-cover" />
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{deal.badge}</Badge>
              <Badge variant="destructive" className="absolute top-3 right-3">
                {deal.discount}
              </Badge>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-lg line-clamp-1">{deal.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{deal.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{deal.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{deal.platform}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">{deal.discountedPrice}</span>
                    <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">
                  Add to Cart
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
