"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, RotateCcw } from "lucide-react";

const recentSearches = [
  {
    id: 1,
    query: "Milk, Bread, Eggs",
    timestamp: "2 hours ago",
    savings: "₹45",
    items: 3,
  },
  {
    id: 2,
    query: "Rice, Oil, Sugar, Onions",
    timestamp: "Yesterday",
    savings: "₹120",
    items: 4,
  },
  {
    id: 3,
    query: "Fruits, Vegetables",
    timestamp: "3 days ago",
    savings: "₹80",
    items: 8,
  },
];

export function RecentSearches() {
  const handleRepeatSearch = (query: string) => {
    window.location.href = `/comparison?q=${encodeURIComponent(query)}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-sans">Recent Searches</h2>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="grid gap-4">
        {recentSearches.map((search) => (
          <Card
            key={search.id}
            className="glass hover:scale-[1.02] transition-transform duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{search.query}</h3>
                    <Badge variant="secondary" className="glass">
                      {search.items} items
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{search.timestamp}</span>
                    <span className="text-primary font-medium">
                      Saved {search.savings}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-0 bg-transparent"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRepeatSearch(search.query)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Repeat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
