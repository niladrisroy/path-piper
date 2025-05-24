
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <InternalNavbar />
      <div className="pt-16 sm:pt-24 pb-16 sm:pb-16 min-h-screen bg-gray-50">
        {children}
      </div>
      <Footer />
    </>
  )
}
