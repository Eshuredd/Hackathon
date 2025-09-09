"use client";

import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Descope widget should not render on server
const DescopeAuth = dynamic(() => import("@/components/descope-auth"), {
  ssr: false,
});

type DescopeLoginDialogProps = {
  triggerClassName?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonText?: string;
};

export default function DescopeLoginDialog({
  triggerClassName,
  buttonVariant = "ghost",
  buttonText = "Login",
}: DescopeLoginDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={triggerClassName}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-md" showCloseButton>
        <div className="p-4 sm:p-6">
          <DescopeAuth />
        </div>
      </DialogContent>
    </Dialog>
  );
}
