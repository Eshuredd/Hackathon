"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, List, Trash2, Edit, Search, Calendar, ShoppingCart } from "lucide-react"

const mockSavedLists = [
  {
    id: "1",
    name: "Weekly Essentials",
    items: ["Milk", "Bread", "Eggs", "Rice", "Oil"],
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
    timesUsed: 8,
  },
  {
    id: "2",
    name: "Party Supplies",
    items: ["Chips", "Soft Drinks", "Ice Cream", "Cake Mix"],
    createdAt: "2024-01-10",
    lastUsed: "2024-01-18",
    timesUsed: 3,
  },
  {
    id: "3",
    name: "Healthy Snacks",
    items: ["Fruits", "Nuts", "Yogurt", "Granola"],
    createdAt: "2024-01-05",
    lastUsed: "2024-01-19",
    timesUsed: 12,
  },
]

export function SavedLists() {
  const [searchQuery, setSearchQuery] = useState("")
  const [lists, setLists] = useState(mockSavedLists)

  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleUseList = (listId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (list) {
      const query = list.items.join(", ")
      window.location.href = `/comparison?q=${encodeURIComponent(query)}`
    }
  }

  const handleDeleteList = (listId: string) => {
    setLists(lists.filter((l) => l.id !== listId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-sans">Saved Lists</h2>
          <p className="text-muted-foreground">Manage your frequently used grocery lists</p>
        </div>
        <Button className="glass">
          <Plus className="w-4 h-4 mr-2" />
          Create New List
        </Button>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your saved lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lists Grid */}
      <div className="grid gap-6">
        {filteredLists.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No lists found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Create your first grocery list to get started"}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New List
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLists.map((list) => (
            <Card key={list.id} className="glass-strong hover:scale-[1.02] transition-transform duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <List className="w-5 h-5 text-primary" />
                    <span>{list.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteList(list.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Items ({list.items.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {list.items.map((item, index) => (
                      <Badge key={index} variant="secondary" className="glass">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>Used {list.timesUsed} times</span>
                  </div>
                  <span>Last used {new Date(list.lastUsed).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button className="flex-1" onClick={() => handleUseList(list.id)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Use This List
                  </Button>
                  <Button variant="outline" className="glass border-0 bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
