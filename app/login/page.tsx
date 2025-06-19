"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { invalidateUserCache } from '@/hooks/use-auth'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Login successful!')
        invalidateUserCache();
        
        // Show redirecting state
        setIsRedirecting(true)
        
        // Small delay to ensure smooth transition
        setTimeout(() => {
          // Redirect based on user role and onboarding status
          if (data.onboardingCompleted) {
            if (data.role === 'student') {
              router.push('/student/profile')
            } else if (data.role === 'mentor') {
              router.push('/mentor/profile')
            } else if (data.role === 'institution') {
              router.push('/institution/profile')
            } else {
              router.push('/feed')
            }
          } else {
            // User needs to complete onboarding
            if (data.role === 'student') {
              router.push('/onboarding')
            } else if (data.role === 'mentor') {
              router.push('/mentor-onboarding')
            } else if (data.role === 'institution') {
              router.push('/institution-onboarding')
            } else {
              router.push('/onboarding')
            }
          }
        }, 500)
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      {/* Loading overlay when redirecting */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pathpiper-teal"></div>
              <p className="text-gray-700 font-medium">Setting up your profile...</p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/pathpiper-logo-full.png"
              alt="PathPiper"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your PathPiper account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isRedirecting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isRedirecting}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-pathpiper-teal hover:bg-pathpiper-teal/90"
              disabled={loading || isRedirecting}
            >
              {loading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link 
              href="/forgot-password" 
              className="text-pathpiper-teal hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-pathpiper-teal hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}