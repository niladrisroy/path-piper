
"use client"

import { useEffect, useState } from "react"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import { useAuth } from "@/hooks/use-auth"

interface SearchParams {
  id?: string
}

export default function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const [studentId, setStudentId] = useState<string | undefined>(undefined)
  const [paramsLoaded, setParamsLoaded] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const params = await searchParams
        setStudentId(params?.id)
      } catch (error) {
        console.error('Error resolving search params:', error)
      } finally {
        setParamsLoaded(true)
      }
    }

    resolveParams()
  }, [searchParams])

  if (loading || !paramsLoaded) {
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
            currentUser={user}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
