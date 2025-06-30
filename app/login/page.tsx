"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { invalidateUserCache } from '@/hooks/use-auth'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState("")

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Calculate mouse position relative to container (0-100)
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [])

  useEffect(() => {
    const emailVerified = searchParams.get('email_verified')
    if (emailVerified === 'true') {
      setSuccessMessage("Your email has been verified! Now once your parent approves your account you will be able to login!")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clear any cached user data and storage before login
      invalidateUserCache()

      // Clear any residual storage to ensure fresh session
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.log('Storage clear error:', error)
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Login successful!")

        setIsRedirecting(true)

        // Determine redirect path based on role and onboarding status
        let redirectPath = '/feed' // default

        if (data.role === 'student') {
          redirectPath = data.onboardingCompleted ? '/feed' : '/onboarding'
        } else if (data.role === 'mentor') {
          redirectPath = data.onboardingCompleted ? '/mentor/profile' : '/mentor-onboarding'
        } else if (data.role === 'institution') {
          redirectPath = data.onboardingCompleted ? '/institution/profile' : '/institution-onboarding'
        }

        // Force a hard navigation to ensure fresh session
        setTimeout(() => {
          window.location.href = redirectPath
        }, 1000)
      } else {
        // Check if it's a parent approval error
        if (data.needsParentApproval) {
          // Show prominent parent approval warning
          toast.error(
            <div className="flex flex-col space-y-3 p-2">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👨‍👩‍👧‍👦</div>
                <div>
                  <div className="font-bold text-base">Parent Approval Required</div>
                  <div className="text-sm opacity-90">Account pending approval</div>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  Please wait for your parent to approve your account first. 
                  Check your parent's email for the approval link.
                </p>
              </div>
            </div>,
            {
              duration: 8000,
              style: {
                background: '#FEF3C7',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                minWidth: '400px'
              }
            }
          )
        } else {
          throw new Error(data.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error:', error)

      // Check if it's a parent approval error
      if (error instanceof Error && error.message.includes('parent approve')) {
        // Show custom warning for parent approval
        toast.error(
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👨‍👩‍👧‍👦</span>
              <span className="font-semibold">Parent Approval Required</span>
            </div>
            <p className="text-sm">Please wait for your parent to approve your account first</p>
          </div>,
          {
            duration: 6000,
            style: {
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E'
            }
          }
        )
      } else {
        toast.error('An error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Suppress hydration warnings for browser extension attributes
  useEffect(() => {
    // This runs only on client side to suppress hydration mismatches
    // caused by browser extensions adding attributes like fdprocessedid
  }, [])

  return (
    <main className="min-h-screen flex flex-col bg-white">
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

      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="h-10">
          <Image
            src="/images/pathpiper-logo-full.png"
            width={180}
            height={40}
            alt="PathPiper Logo"
            className="h-full w-auto"
          />
        </Link>
        <div>
          <Link href="/signup">
            <Button variant="ghost" className="text-teal-500 hover:text-teal-600 hover:bg-teal-50" suppressHydrationWarning>
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left side - Visual content with Pip character */}
        <div className="hidden md:block md:w-1/2 relative pt-[20px] pb-[20px]">
          <div
            ref={containerRef}
            className="ml-[20px] rounded-2xl relative overflow-hidden flex flex-col p-8 h-full"
            style={{ width: "calc(100% - 20px)" }}
          >
            {/* Interactive gradient background */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                  rgba(45, 212, 191, 0.5) 0%, 
                  rgba(147, 51, 234, 0.3) 25%, 
                  rgba(249, 115, 22, 0.2) 50%, 
                  rgba(59, 130, 246, 0.1) 75%, 
                  rgba(15, 23, 42, 0) 100%)`,
              }}
            />

            {/* Welcome back text - positioned at top left */}
            <div className="z-10 mb-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
                  PathPiper
                </span>
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Continue your educational journey with us
              </p>
            </div>

            {/* Floating Pip character with bounce effect - larger size */}
            <motion.div
              className="relative z-10 mx-auto my-auto flex-grow flex items-center justify-center py-8"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              style={{
                filter: "drop-shadow(0px 10px 15px rgba(45, 212, 191, 0.3))",
              }}
            >
              <Image
                src="/images/pip-character.png"
                width={500}
                height={500}
                alt="Pip Character"
                className="w-[600px] h-auto"
                priority
              />
            </motion.div>

            {/* Animated floating orbs */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-teal-500/20 blur-xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 10}% + 10%)`,
                top: `calc(${mousePosition.y / 10}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                right: `calc(${mousePosition.x / 15}% + 10%)`,
                bottom: `calc(${mousePosition.y / 15}% + 20%)`,
              }}
            />

            <motion.div
              className="absolute w-24 h-24 rounded-full bg-yellow-500/20 blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                left: `calc(${mousePosition.x / 12}% + 30%)`,
                bottom: `calc(${mousePosition.y / 12}% + 10%)`,
              }}
            />
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Card className="w-full border-0 shadow-none md:border md:shadow-sm">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4 md:hidden">
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
              <CardContent className="space-y-6">
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
                  </Alert>
                )}
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
                      className="rounded-lg border-slate-300"
                      suppressHydrationWarning
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
                      className="rounded-lg border-slate-300"
                      suppressHydrationWarning
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full py-6"
                    disabled={loading || isRedirecting}
                    suppressHydrationWarning
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
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto flex justify-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PathPiper. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}