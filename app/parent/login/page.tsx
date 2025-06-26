
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserCheck, Users, LogIn, ArrowLeft, Shield } from "lucide-react"

export default function ParentLoginPage() {
  const [mode, setMode] = useState<'choice' | 'newParent' | 'existingParent'>('choice')
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/parent/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        if (data.hasAccount) {
          // Parent already has account, redirect to regular login
          router.push(`/api/auth/login?email=${encodeURIComponent(email)}&type=parent`)
        } else {
          // Parent exists but no account, proceed to password creation
          setStep('password')
        }
      } else {
        setError(data.error || 'Email verification failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExistingParentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        // Check if user is actually a parent
        if (data.role === 'parent') {
          router.push('/parent/dashboard')
        } else {
          setError('This account is not registered as a parent account')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/parent/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to parent dashboard
        router.push('/parent/dashboard')
      } else {
        setError(data.error || 'Account creation failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pathpiper-teal/5 via-white to-pathpiper-purple/5">
      {/* Header matching main theme */}
      <header className="w-full py-6 px-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="h-12">
              <Image
                src="/images/pathpiper-logo-full.png"
                width={220}
                height={48}
                alt="PathPiper Logo"
                className="h-full w-auto"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-pathpiper-teal hover:text-pathpiper-teal/80 hover:bg-pathpiper-teal/10 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Student Login</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pathpiper-teal to-pathpiper-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pathpiper-teal to-pathpiper-purple bg-clip-text text-transparent">
                Parent Portal
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {mode === 'choice' && 'Secure access to manage your child\'s account'}
                {mode === 'newParent' && (step === 'email' ? 'Enter your registered email address' : 'Create your secure password')}
                {mode === 'existingParent' && 'Welcome back! Please sign in'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <UserCheck className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {mode === 'choice' && (
                <div className="space-y-4">
                  <Button 
                    onClick={() => setMode('existingParent')}
                    className="w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue hover:from-pathpiper-teal/90 hover:to-pathpiper-blue/90 text-white py-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-lg font-medium">I have an account</span>
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setMode('newParent')}
                    variant="outline"
                    className="w-full border-2 border-pathpiper-teal/20 hover:border-pathpiper-teal/40 hover:bg-pathpiper-teal/5 py-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300"
                  >
                    <Users className="w-5 h-5 text-pathpiper-teal" />
                    <span className="text-lg font-medium text-pathpiper-teal">First time setup</span>
                  </Button>

                  <div className="bg-gradient-to-r from-pathpiper-teal/10 to-pathpiper-blue/10 rounded-xl p-4 mt-6">
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                      <Shield className="w-4 h-4 inline mr-1 text-pathpiper-teal" />
                      Your child's safety is our priority. Parent approval required for accounts under 16.
                    </p>
                  </div>
                </div>
              )}

              {mode === 'existingParent' && (
                <form onSubmit={handleExistingParentLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-pathpiper-teal focus:ring-pathpiper-teal/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-12 rounded-xl border-gray-200 focus:border-pathpiper-teal focus:ring-pathpiper-teal/20 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pathpiper-teal transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue hover:from-pathpiper-teal/90 hover:to-pathpiper-blue/90 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Button 
                    type="button"
                    onClick={() => {
                      setMode('choice')
                      setEmail('')
                      setPassword('')
                      setError('')
                    }}
                    variant="ghost"
                    className="w-full text-pathpiper-teal hover:text-pathpiper-teal/80 hover:bg-pathpiper-teal/5"
                  >
                    Back to options
                  </Button>
                </form>
              )}

              {mode === 'newParent' && step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-pathpiper-teal focus:ring-pathpiper-teal/20"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue hover:from-pathpiper-teal/90 hover:to-pathpiper-blue/90 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Continue'}
                  </Button>

                  <Button 
                    type="button"
                    onClick={() => {
                      setMode('choice')
                      setEmail('')
                      setError('')
                    }}
                    variant="ghost"
                    className="w-full text-pathpiper-teal hover:text-pathpiper-teal/80 hover:bg-pathpiper-teal/5"
                  >
                    Back to options
                  </Button>
                </form>
              )}

              {mode === 'newParent' && step === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-pathpiper-teal/10 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Email verified:</span>
                      <span className="text-sm font-semibold text-green-900">{email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Create Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        required
                        className="h-12 rounded-xl border-gray-200 focus:border-pathpiper-teal focus:ring-pathpiper-teal/20 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pathpiper-teal transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-pathpiper-teal focus:ring-pathpiper-teal/20"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pathpiper-teal to-pathpiper-blue hover:from-pathpiper-teal/90 hover:to-pathpiper-blue/90 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account & Sign In'}
                  </Button>

                  <Button 
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    variant="ghost"
                    className="w-full text-pathpiper-teal hover:text-pathpiper-teal/80 hover:bg-pathpiper-teal/5"
                  >
                    Back to email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer matching main theme */}
      <footer className="w-full py-6 px-6 bg-white border-t border-gray-100">
        <div className="container mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PathPiper. All rights reserved. • Safe • Educational • Parent-Controlled
          </p>
        </div>
      </footer>
    </div>
  )
}
