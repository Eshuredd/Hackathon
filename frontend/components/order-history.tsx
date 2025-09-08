"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Package, Calendar, Search, Download, RotateCcw, MapPin, Clock, CheckCircle, Truck } from "lucide-react"

const mockOrderHistory = [
  {
    id: "SG-2024-047",
    date: "2024-01-20",
    status: "delivered",
    platform: "BigBasket",
    items: ["Milk", "Bread", "Eggs"],
    total: 165,
    savings: 25,
    deliveryAddress: "123 Main Street, Mumbai",
    deliveredAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "SG-2024-046",
    date: "2024-01-18",
    status: "delivered",
    platform: "Amazon Fresh",
    items: ["Rice", "Oil", "Sugar", "Onions"],
    total: 450,
    savings: 80,
    deliveryAddress: "123 Main Street, Mumbai",
    deliveredAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "SG-2024-045",
    date: "2024-01-15",
    status: "delivered",
    platform: "Flipkart",
    items: ["Fruits", "Vegetables"],
    total: 320,
    savings: 45,
    deliveryAddress: "123 Main Street, Mumbai",
    deliveredAt: "2024-01-15T11:20:00Z",
  },
  {
    id: "SG-2024-044",
    date: "2024-01-12",
    status: "cancelled",
    platform: "BigBasket",
    items: ["Dairy Products"],
    total: 280,
    savings: 0,
    deliveryAddress: "123 Main Street, Mumbai",
  },
]

export function OrderHistory() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOrders = mockOrderHistory.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getPlatformLogo = (platform: string) => {
    const logos = {
      BigBasket: "🛒",
      "Amazon Fresh": "📦",
      Flipkart: "🛍️",
    }
    return logos[platform as keyof typeof logos] || "🏪"
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      BigBasket: "bg-green-500",
      "Amazon Fresh": "bg-orange-500",
      Flipkart: "bg-blue-500",
    }
    return colors[platform as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-sans">Order History</h2>
          <p className="text-muted-foreground">Track your past orders and reorder your favorites</p>
        </div>
        <Button variant="outline" className="glass border-0 bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID, platform, or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "You haven't placed any orders yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

            {filteredOrders.map((order, index) => (
              <div key={order.id} className="relative flex items-start space-x-6 pb-8">
                {/* Timeline Node */}
                <div
                  className={`relative z-10 w-16 h-16 ${getStatusColor(order.status)} rounded-full flex items-center justify-center text-white`}
                >
                  {getStatusIcon(order.status)}
                </div>

                {/* Order Card */}
                <Card className="flex-1 glass-strong">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">Order {order.id}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 ${getPlatformColor(order.platform)} rounded-full flex items-center justify-center text-white text-sm`}
                          >
                            {getPlatformLogo(order.platform)}
                          </div>
                          <span className="font-medium">{order.platform}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Items</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, itemIndex) => (
                          <Badge key={itemIndex} variant="secondary" className="glass">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.status === "delivered" && order.deliveredAt && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Delivered to {order.deliveryAddress}</span>
                        <span>•</span>
                        <span>{new Date(order.deliveredAt).toLocaleString()}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Order Summary */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold">₹{order.total}</span>
                          {order.savings > 0 && (
                            <Badge variant="secondary" className="glass text-primary">
                              Saved ₹{order.savings}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm" className="glass border-0 bg-transparent">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
