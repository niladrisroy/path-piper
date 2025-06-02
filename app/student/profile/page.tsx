"use client"

import { useEffect, useState } from "react"
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
  const [studentId, setStudentId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const resolveParams = async () => {
      const params = await searchParams
      setStudentId(params?.id)
    }

    resolveParams()
  }, [searchParams])

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <StudentProfile 
            studentId={studentId} 
            currentUser={null} // Let ProtectedLayout handle user data
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}