"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("John Doe");
  const [loginEmail, setLoginEmail] = useState<string>("john@example.com");

  useEffect(() => {
    const readDescopeUser = () => {
      try {
        // Prefer values that Descope SDK stores
        const name =
          (typeof window !== "undefined" &&
            localStorage.getItem("dls_last_user_display_name")) ||
          undefined;
        const loginId =
          (typeof window !== "undefined" &&
            localStorage.getItem("dls_last_user_login_id")) ||
          undefined;

        // Sometimes Descope stores a richer JSON blob with email
        let authEmail: string | undefined;
        try {
          const raw =
            typeof window !== "undefined" &&
            localStorage.getItem("dls_last_auth");
          if (raw) {
            const obj = JSON.parse(raw);
            const maybeEmail = obj?.user?.email || obj?.email || obj?.loginId;
            if (typeof maybeEmail === "string" && maybeEmail.includes("@")) {
              authEmail = maybeEmail;
            }
          }
        } catch {}

        let tokenPayload: any | undefined;
        try {
          const token =
            (typeof window !== "undefined" &&
              (localStorage.getItem("DS") ||
                localStorage.getItem("auth-token"))) ||
            undefined;
          if (token && token.split(".").length === 3) {
            const payload = token
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const json = JSON.parse(atob(payload));
            tokenPayload = json;
          }
        } catch {}

        const nextName = (tokenPayload?.name as string) || name || displayName;
        const nextEmail =
          (tokenPayload?.email as string) ||
          authEmail ||
          (loginId && loginId.includes("@") ? loginId : undefined) ||
          loginEmail;
        if (nextName) setDisplayName(nextName);
        if (nextEmail) setLoginEmail(nextEmail);
      } catch {}
    };

    readDescopeUser();
    const onStorage = () => readDescopeUser();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        // Clear Descope-related storage and our cached user id/token flag
        try {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("DS") || k.startsWith("descope")) {
              localStorage.removeItem(k);
            }
          });
        } catch {}
      }
    } catch {}
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl font-sans">Smart Grocery</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="relative h-12 w-12 rounded-full ring-1 ring-border hover:ring-primary/40 hover:shadow-md transition-shadow cursor-pointer inline-flex items-center justify-center"
              aria-label="Open user menu"
              title="Account menu"
            >
              <div className="h-12 w-12 rounded-full bg-secondary/60 text-foreground inline-flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 glass border-0 text-[15px]"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-semibold leading-none">
                    {displayName}
                  </p>
                  <p className="text-sm leading-none text-muted-foreground">
                    {loginEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="py-3 text-[15px]">
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 text-[15px]">
                <Link href="/profile" className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="py-3 text-[15px]"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
