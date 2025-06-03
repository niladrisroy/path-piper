"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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

  const handle = params?.handle as string

  useEffect(() => {
    const loadMockData = async () => {
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock current user
        const mockCurrentUser = {
          id: 'current-user-123',
          firstName: 'Current',
          lastName: 'User',
          email: 'current@example.com'
        }

        // Mock student data
        const mockStudentData = {
          id: handle,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          bio: 'Passionate about technology and learning new skills.',
          location: 'San Francisco, CA',
          interests: [
            { id: 1, name: 'Web Development' },
            { id: 2, name: 'Machine Learning' },
            { id: 3, name: 'Photography' }
          ],
          skills: [
            { id: 1, name: 'JavaScript', level: 4 },
            { id: 2, name: 'Python', level: 3 },
            { id: 3, name: 'React', level: 4 }
          ],
          educationHistory: [
            {
              id: 1,
              institutionName: 'Stanford University',
              degree: 'Computer Science',
              startDate: '2020-09-01',
              endDate: '2024-06-01',
              isCurrent: false
            }
          ]
        }

        setCurrentUser(mockCurrentUser)
        setStudentData(mockStudentData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading mock data:', error)
        setError('Error loading profile')
        setLoading(false)
      }
    }

    if (handle) {
      loadMockData()
    }
  }, [handle])

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