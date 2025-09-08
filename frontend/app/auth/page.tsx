import dynamic from "next/dynamic";

const DescopeAuth = dynamic(() => import("@/components/descope-auth"), {
  ssr: false,
});

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <DescopeAuth />
      </div>
    </div>
  );
}
