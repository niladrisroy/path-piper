
"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ProfileEditForm from "@/components/profile/profile-edit-form"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"

interface StudentData {
  id: string
  firstName: string
  lastName: string
  bio?: string
  profileImageUrl?: string
}

export default function ParentStudentProfilePage() {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  useEffect(() => {
    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/parent/student/${studentId}`)
      const data = await response.json()

      if (data.success) {
        setStudent(data.student)
      } else {
        setError(data.error || 'Failed to load student data')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/parent/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading student profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h1>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <InternalNavbar />
      <main className="flex-grow pt-16 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {/* Header with back button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button 
                onClick={handleBackToDashboard}
                variant="outline"
                className="mb-4 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Managing: {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                You have full access to view and edit your child's profile
              </p>
            </div>
          </div>

          {/* Profile Edit Form - Same as student's own view */}
          <ProfileEditForm 
            userId={student.id} 
            isParentView={true}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
