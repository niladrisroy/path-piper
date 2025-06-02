
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Simplified authentication check - trust middleware for initial protection
    const verifyAuth = async () => {
      try {
        // Since middleware already checked cookies, just verify the session
        const response = await fetch("/api/auth/user", {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setIsAuthenticated(true)
            return
          }
        }
        
        // If verification fails, redirect to login
        setIsAuthenticated(false)
        router.push("/login")
      } catch (error) {
        console.error("ProtectedLayout: Auth verification failed:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    verifyAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show nothing (redirect is happening)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children without additional layout wrapper
  // since the individual pages handle their own layout
  return <>{children}</>
}
