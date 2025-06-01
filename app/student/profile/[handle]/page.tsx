
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../../protected-layout"

export default function StudentProfileHandlePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  
  const handle = params?.handle as string

  useEffect(() => {
    const fetchStudentByHandle = async () => {
      try {
        // Get current user for context
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch current user profile
        const userResponse = await fetch('/api/auth/user')
        const userData = await userResponse.json()
        
        if (!userData.success) {
          router.push('/login')
          return
        }

        setCurrentUser(userData.user)

        // Fetch student profile by handle
        // Note: You'll need to add a unique handle field to your student profiles
        // For now, we'll treat the handle as a user ID
        const studentResponse = await fetch(`/api/student/profile/${handle}`)
        
        if (!studentResponse.ok) {
          if (studentResponse.status === 404) {
            setError('Student profile not found')
          } else {
            setError('Error loading profile')
          }
          setLoading(false)
          return
        }

        const studentData = await studentResponse.json()
        setStudentData(studentData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching student profile:', error)
        setError('Error loading profile')
        setLoading(false)
      }
    }

    if (handle) {
      fetchStudentByHandle()
    }
  }, [handle, router, supabase.auth])

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

  if (error) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">😞</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-pathpiper-teal text-white rounded-lg hover:bg-pathpiper-teal/90 transition-colors"
              >
                Go Back
              </button>
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
            studentId={handle}
            currentUser={currentUser}
            studentData={studentData}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
