"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting login for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        toast.error(error.message || "Login failed")
        return
      }

      if (data?.user?.id) {
        console.log("Login successful, user ID:", data.user.id)

        // Set access token in cookie for API authentication
        if (data.session?.access_token) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600; secure; samesite=strict`
          console.log("Access token cookie set")
        }

        toast.success("Login successful!")

        // Check user profile to determine role and onboarding status
        try {
          const profileResponse = await fetch("/api/auth/user", {
            method: "GET",
            credentials: 'include',
            cache: 'no-store'
          })

          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            console.log("Profile data:", profileData)

            if (profileData.user) {
              const user = profileData.user

              // Route based on role and onboarding status
              if (user.role === 'student') {
                if (user.onboardingCompleted) {
                  router.push('/feed')
                } else {
                  router.push('/onboarding')
                }
              } else if (user.role === 'mentor') {
                if (user.onboardingCompleted) {
                  router.push('/mentor')
                } else {
                  router.push('/mentor-onboarding')
                }
              } else if (user.role === 'institution') {
                if (user.onboardingCompleted) {
                  router.push('/institution')
                } else {
                  router.push('/institution-onboarding')
                }
              } else {
                // Fallback to feed if role is unclear
                router.push('/feed')
              }
            } else {
              console.warn("No user data in profile response")
              router.push('/feed')
            }
          } else {
            console.error("Failed to fetch profile data")
            router.push('/feed')
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
          router.push('/feed')
        }
      } else {
        console.error("No user ID in response")
        toast.error("Login failed - no user data")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/pathpiper-logo-full.png"
              alt="PathPiper"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Welcome back</CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to your PathPiper account to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/forgot-password" 
                className="text-teal-600 hover:text-teal-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-lg py-2.5 font-medium transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}