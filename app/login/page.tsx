"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { loginUser } from "@/lib/services/auth-service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await loginUser({ email, password })

      if (result.success) {
        // Get redirect URL from query params or default based on role
        const redirectURL = searchParams?.get('redirectURL') || searchParams?.get('from')

        if (redirectURL) {
          router.push(redirectURL)
        } else {
          // Redirect based on onboarding status and role
          if (!result.onboardingCompleted) {
            if (result.role === 'mentor') {
              router.push('/mentor-onboarding')
            } else if (result.role === 'institution') {
              router.push('/institution-onboarding')
            } else {
              router.push('/onboarding')
            }
          } else {
            // Redirect to appropriate dashboard based on role
            switch (result.role) {
              case 'mentor':
                router.push('/mentor/profile')
                break
              case 'institution':
                router.push('/institution/profile')
                break
              case 'student':
              default:
                router.push('/feed')
                break
            }
          }
        }
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/">
            <Image
              src="/images/pathpiper-logo-full.png"
              alt="PathPiper"
              width={200}
              height={60}
              className="mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Login Form */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your PathPiper account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-pathpiper-teal hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-pathpiper-teal hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}