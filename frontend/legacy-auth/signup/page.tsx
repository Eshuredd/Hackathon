import { AuthForm } from "@/components/auth-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <AuthForm mode="signup" />
    </div>
  )
}


