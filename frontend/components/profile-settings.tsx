"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { AccountInfo } from "@/components/account-info";
import { SavedLists } from "@/components/saved-lists";
import { OrderHistory } from "@/components/order-history";
import { User, List, Clock, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");

  const handleLogout = () => {
    // Clear auth tokens and redirect
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Profile & Settings
            </span>
          </div>
          <h1 className="text-3xl font-bold font-sans">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information, saved lists, and order history
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 glass">
              <TabsTrigger
                value="account"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Account Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="lists"
                className="flex items-center space-x-2"
              >
                <List className="w-4 h-4" />
                <span>Saved Lists</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Order History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <AccountInfo />
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <SavedLists />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <OrderHistory />
            </TabsContent>
          </Tabs>

          {/* Logout Section */}
          <Card className="glass-strong mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your Smart Grocery account
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
