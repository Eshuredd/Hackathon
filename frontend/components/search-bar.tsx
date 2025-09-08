"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<string[]>([])

  const addItem = () => {
    if (query.trim() && !items.includes(query.trim())) {
      setItems([...items, query.trim()])
      setQuery("")
    }
  }

  const removeItem = (item: string) => {
    setItems(items.filter((i) => i !== item))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addItem()
    }
    if (items.length > 0 || query.trim()) {
      const searchQuery = items.length > 0 ? items.join(", ") + (query.trim() ? ", " + query.trim() : "") : query.trim()
      onSearch(searchQuery)
    }
  }

  const quickItems = ["Milk", "Bread", "Eggs", "Rice", "Oil", "Sugar", "Onions", "Tomatoes"]

  return (
    <Card className="glass-strong p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Enter your grocery list (e.g. Milk, Eggs, Bread)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="glass border-0 pr-12 text-lg py-6"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={addItem}
              disabled={!query.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button type="submit" size="lg" className="px-8">
            <Search className="w-5 h-5 mr-2" />
            Compare & Shop
          </Button>
        </div>

        {/* Added Items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Your grocery list:</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <Badge key={index} variant="secondary" className="glass px-3 py-1 text-sm">
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 hover:bg-transparent"
                    onClick={() => removeItem(item)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Quick Add Items */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {quickItems.map((item) => (
            <Button
              key={item}
              variant="outline"
              size="sm"
              className="glass border-0 bg-transparent"
              onClick={() => {
                if (!items.includes(item)) {
                  setItems([...items, item])
                }
              }}
              disabled={items.includes(item)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {item}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
