"use client"

import { useEffect, useState } from "react"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function StudentProfilePage() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Redirect non-students to their appropriate profile pages
    if (user.role !== 'student') {
      if (user.role === 'mentor') {
        router.push('/mentor/profile')
      } else if (user.role === 'institution') {
        router.push('/institution/profile')
      } else {
        router.push('/feed')
      }
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">😞</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-pathpiper-teal text-white rounded-lg hover:bg-pathpiper-teal/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  if (!user || user.role !== 'student') {
    return null // This will be handled by the useEffect redirect
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <StudentProfile studentId={user?.id} currentUser={user} />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}