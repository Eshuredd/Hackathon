"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function AuthNotice() {
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    try {
      // If Descope SDK exposes user id globally, cache it for API headers
      const maybeUserId = (window as any)?.Descope?.user?.id;
      if (maybeUserId) {
        localStorage.setItem("descope_user_id", String(maybeUserId));
      }
      const flag =
        typeof window !== "undefined" &&
        localStorage.getItem("descope_token_created");
      // Only show on dashboard page
      const onDashboard = pathname === "/dashboard";
      if (flag && onDashboard) {
        toast({
          title: "Descope Auth Key created",
        });
        localStorage.removeItem("descope_token_created");
      }
      // Best-effort: when logging out, clear cached user id if Descope storage is empty
      const hasDescope =
        typeof window !== "undefined" && !!localStorage.getItem("DS");
      if (!hasDescope) {
        // If Descope cleared its storage, also clear our cached user id
        localStorage.removeItem("descope_user_id");
      }
    } catch {}
  }, [toast, pathname]);

  return null;
}
