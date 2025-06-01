
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        // First check if we have session cookies (similar to middleware check)
        const hasAuthCookie = document.cookie.includes('sb-access-token') || 
                             document.cookie.includes('sb:token') || 
                             document.cookie.includes('sb-auth-token') ||
                             document.cookie.includes('supabase')

        if (!hasAuthCookie) {
          console.log("ProtectedLayout: No auth cookies found, redirecting to login")
          setIsAuthenticated(false)
          router.push("/login")
          return
        }

        // If we have cookies, verify with the server
        const response = await fetch("/api/auth/user", {
          method: 'GET',
          credentials: 'include', // Include cookies
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log("ProtectedLayout: Authentication successful")
            setIsAuthenticated(true)
          } else {
            console.log("ProtectedLayout: Authentication failed - invalid response")
            setIsAuthenticated(false)
            router.push("/login")
          }
        } else {
          console.log("ProtectedLayout: Authentication failed - HTTP", response.status)
          setIsAuthenticated(false)
          router.push("/login")
        }
      } catch (error) {
        console.error("ProtectedLayout: Error checking authentication:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    checkAuth()
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
