"use client";

import { AuthProvider, Descope } from "@descope/react-sdk";
import { useRouter } from "next/navigation";

export default function DescopeAuth(): JSX.Element {
  const router = useRouter();
  const projectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;

  if (!projectId) {
    return (
      <div className="p-4 text-sm text-red-600">
        Missing NEXT_PUBLIC_DESCOPE_PROJECT_ID. Add it to your .env.local.
      </div>
    );
  }

  return (
    <AuthProvider
      projectId={projectId}
      baseUrl={process.env.NEXT_PUBLIC_DESCOPE_BASE_URL}
    >
      <Descope
        flowId="sign-up-or-in"
        theme="light"
        onSuccess={() => {
          router.push("/dashboard");
        }}
        onError={(err) => {
          // console.error("Descope error", err);
        }}
      />
    </AuthProvider>
  );
}
