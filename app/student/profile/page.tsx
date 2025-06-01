
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../protected-layout"

export default function StudentProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{
    id?: string
  }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studentId, setStudentId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // First resolve searchParams
        const params = await searchParams
        const resolvedStudentId = params?.id
        setStudentId(resolvedStudentId)

        // Fetch user profile to determine role
        const response = await fetch('/api/auth/user')
        const userData = await response.json()
        
        if (!userData.success) {
          router.push('/login')
          return
        }

        setCurrentUser(userData.user)

        // If no studentId is provided, check user role and redirect accordingly
        if (!resolvedStudentId) {
          switch (userData.user.role) {
            case 'mentor':
              router.push('/mentor/profile')
              return
            case 'institution':
              router.push('/institution/profile')
              return
            case 'student':
              // Stay on this page, will show current user's profile
              break
            default:
              router.push('/login')
              return
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      }
    }

    checkUserAndRedirect()
  }, [searchParams, router])

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pathpiper-teal mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <StudentProfile 
            studentId={studentId} 
            currentUser={currentUser}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
