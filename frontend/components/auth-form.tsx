"use client";
import { useState } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const router = useRouter();

  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: "",
    otp: "",
    otpSent: false,
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login/" : "/auth/register/";
      const payload =
        mode === "login"
          ? { email: emailForm.email, password: emailForm.password }
          : {
              name: emailForm.name,
              email: emailForm.email,
              password: emailForm.password,
            };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful response
      console.log(`${mode} successful with:`, payload);
      router.push("/home");
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      // Simulate OTP API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("OTP sent to:", phoneForm.phone);
      setPhoneForm((prev) => ({ ...prev, otpSent: true }));
    } catch (error) {
      console.error("OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("OTP verified:", phoneForm.otp);
      router.push("/home");
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Smart Grocery</span>
        </div>
      </div>

      <Card className="glass-strong border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold font-sans">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === "login"
              ? "Sign in to your Smart Grocery account"
              : "Join thousands of smart shoppers today"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger
                value="email"
                className="flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger
                value="phone"
                className="flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={emailForm.name}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="glass border-0"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="glass border-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={emailForm.password}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      className="glass border-0 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={emailForm.confirmPassword}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                      className="glass border-0"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-6">
              {!phoneForm.otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneForm.phone}
                      onChange={(e) =>
                        setPhoneForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      required
                      className="glass border-0"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={handleSendOTP}
                    disabled={isLoading || !phoneForm.phone}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={phoneForm.otp}
                      onChange={(e) =>
                        setPhoneForm((prev) => ({
                          ...prev,
                          otp: e.target.value,
                        }))
                      }
                      required
                      maxLength={6}
                      className="glass border-0 text-center text-lg tracking-widest"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      OTP sent to {phoneForm.phone}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      setPhoneForm((prev) => ({
                        ...prev,
                        otpSent: false,
                        otp: "",
                      }))
                    }
                  >
                    Change Phone Number
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <Link
                  href="/auth"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/auth"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
