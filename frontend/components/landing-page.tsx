"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShoppingCart,
  Zap,
  TrendingDown,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-sans">Smart Grocery</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8 inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">
              AI-Powered Price Comparison
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance font-sans bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Smarter Grocery Shopping, Automated.
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Compare prices across Flipkart, BigBasket, and Amazon Fresh
            instantly. Save time and money with our intelligent shopping
            assistant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Shopping
                <ShoppingCart className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Floating grocery icons */}
          <div className="relative">
            <div className="absolute -top-10 left-1/4 animate-bounce delay-100">
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
                🥛
              </div>
            </div>
            <div className="absolute -top-6 right-1/3 animate-bounce delay-300">
              <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                🍞
              </div>
            </div>
            <div className="absolute top-4 left-1/6 animate-bounce delay-500">
              <div className="w-8 h-8 glass rounded-full flex items-center justify-center">
                🥚
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">
              Why Choose Smart Grocery?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of grocery shopping with our intelligent
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-sans">Best Prices</h3>
              <p className="text-muted-foreground">
                Compare prices across multiple platforms and always get the best
                deals available.
              </p>
            </Card>

            <Card className="glass p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-sans">
                Lightning Fast
              </h3>
              <p className="text-muted-foreground">
                Get instant price comparisons and complete your shopping in
                seconds, not minutes.
              </p>
            </Card>

            <Card className="glass p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-sans">
                Secure Checkout
              </h3>
              <p className="text-muted-foreground">
                Shop with confidence using our secure payment system and trusted
                platform partners.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="glass-strong p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-sans">
              Ready to Start Smart Shopping?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who are already saving time and money
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Smart Grocery Agent</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Smart Grocery Agent. Built for the future of shopping.
          </p>
        </div>
      </footer>
    </div>
  );
}
