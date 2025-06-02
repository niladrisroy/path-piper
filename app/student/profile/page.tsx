"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
    const resolveParamsAndFetchUser = async () => {
      try {
        // First resolve searchParams
        const params = await searchParams
        const resolvedStudentId = params?.id
        setStudentId(resolvedStudentId)

        // Single authentication check
        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: 'include',
          cache: 'no-store'
        })

        if (response.ok) {
          const userData = await response.json()
          console.log("User data received:", userData)

          if (userData.user) {
            setCurrentUser(userData.user)

            // Role-based redirect logic (only if no studentId is provided)
            if (!resolvedStudentId) {
              switch (userData.user.role) {
                case 'mentor':
                  router.push('/mentor/profile')
                  return
                case 'institution':
                  router.push('/institution/profile')
                  return
                case 'student':
                  // Stay on this page for students
                  break
                default:
                  console.error('Unknown role detected:', userData.user.role)
                  router.push("/login")
                  return
              }
            }
          } else {
            console.warn("No user data found in response")
            router.push("/login")
            return
          }
        } else {
          console.error("Failed to fetch user data:", response.status)
          if (response.status === 401) {
            router.push("/login")
            return
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    resolveParamsAndFetchUser()
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