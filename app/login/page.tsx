
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Starting login process...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok && data.success) {
        toast.success("Login successful!")

        // Check if onboarding is completed
        if (data.onboardingCompleted) {
          console.log('User onboarding completed, redirecting to appropriate profile...')

          // Redirect based on role
          switch (data.role) {
            case 'mentor':
              router.push('/mentor/profile')
              break
            case 'institution':
              router.push('/institution/profile')
              break
            case 'student':
            default:
              router.push('/student/profile')
              break
          }
        } else {
          console.log('Onboarding not completed, redirecting based on role...')
          if (data.role === 'mentor') {
            router.push('/mentor-onboarding')
          } else if (data.role === 'institution') {
            router.push('/institution-onboarding')
          } else {
            router.push('/onboarding')
          }
        }
      } else {
        console.error("Login failed:", data.error)
        toast.error(data.error || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="relative h-12 w-auto">
                <Image
                  src="/images/pathpiper-logo-full.png"
                  alt="PathPiper"
                  width={200}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your PathPiper account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-pathpiper-teal hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pathpiper-teal to-blue-500 hover:from-pathpiper-teal/90 hover:to-blue-500/90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign in</span>
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-pathpiper-teal hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
