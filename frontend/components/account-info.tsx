"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Camera,
  Shield,
} from "lucide-react";

export function AccountInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    address: "123 Main Street, Mumbai, Maharashtra 400001",
  });

  // Hydrate from Descope/local storage
  useEffect(() => {
    try {
      let tokenPayload: any | undefined;
      const token =
        (typeof window !== "undefined" &&
          (localStorage.getItem("DS") || localStorage.getItem("auth-token"))) ||
        undefined;
      if (token && token.split(".").length === 3) {
        try {
          const payload = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          tokenPayload = JSON.parse(atob(payload));
        } catch {}
      }

      const displayName =
        (tokenPayload?.name as string) ||
        (typeof window !== "undefined" &&
          localStorage.getItem("dls_last_user_display_name")) ||
        undefined;
      let emailFromStores: string | undefined = tokenPayload?.email as string;
      if (!emailFromStores) {
        try {
          const raw =
            typeof window !== "undefined" &&
            localStorage.getItem("dls_last_auth");
          if (raw) {
            const obj = JSON.parse(raw as string);
            const maybeEmail = obj?.user?.email || obj?.email || obj?.loginId;
            if (typeof maybeEmail === "string" && maybeEmail.includes("@"))
              emailFromStores = maybeEmail;
          }
        } catch {}
      }
      if (!emailFromStores) {
        const loginId =
          typeof window !== "undefined" &&
          localStorage.getItem("dls_last_user_login_id");
        if (typeof loginId === "string" && loginId.includes("@"))
          emailFromStores = loginId;
      }

      setUserInfo((prev) => ({
        ...prev,
        name: displayName || prev.name,
        email: emailFromStores || prev.email,
      }));
    } catch {}
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-secondary/60 text-foreground inline-flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{userInfo.name}</h3>
              <p className="text-muted-foreground">Member since January 2024</p>
              <Badge variant="secondary" className="glass">
                <Shield className="w-3 h-3 mr-1" />
                Verified Account
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="glass-strong">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="glass border-0"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Full Name</span>
              </Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={!isEditing}
                className="glass border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={!isEditing}
                className="glass border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={userInfo.phone}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, phone: e.target.value }))
                }
                disabled={!isEditing}
                className="glass border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Address</span>
              </Label>
              <Input
                id="address"
                value={userInfo.address}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, address: e.target.value }))
                }
                disabled={!isEditing}
                className="glass border-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">47</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">₹12,450</div>
              <div className="text-sm text-muted-foreground">Total Savings</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-foreground">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
