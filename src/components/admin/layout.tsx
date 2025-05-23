import { withConvexProvider } from "@/lib/convex"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { Authenticated, Unauthenticated } from "convex/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, LogIn, UserPlus } from "lucide-react"

export default withConvexProvider(
  ({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) => {
    return (
      <>
        <Authenticated>{children}</Authenticated>
        <Unauthenticated>
          <div className="flex min-h-screen items-center justify-center">
            <SignIn />
          </div>
        </Unauthenticated>
      </>
    )
  },
  "auth",
)

export function SignIn() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<"signUp" | "signIn">("signIn")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      await signIn("password", formData)
    } catch (err) {
      setError("Authentication failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg bg-red-400">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === "signIn" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === "signIn"
            ? "Enter your credentials to sign in to your account"
            : "Enter your information to create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <input name="flow" type="hidden" value={step} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {step === "signIn" ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign in
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Sign up
                  </>
                )}
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-red-900 rounded px-2 text-red-500">Or</span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
          disabled={isLoading}
        >
          {step === "signIn" ? "Create a new account" : "Sign in to existing account"}
        </Button>
      </CardFooter>
    </Card>
  )
}
