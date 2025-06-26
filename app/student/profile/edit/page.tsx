
"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "@/app/protected-layout"
import ProfileEditForm from "@/components/profile/profile-edit-form"

function ProfileEditContent() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isParentView, setIsParentView] = useState(false)
  const [studentName, setStudentName] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if this is parent view mode
  useEffect(() => {
    const checkParentView = () => {
      const parentViewMode = document.cookie.includes('parent-view-mode=true')
      const parentViewStudentId = document.cookie.split('; ').find(row => row.startsWith('parent-view-student-id='))?.split('=')[1]
      
      setIsParentView(parentViewMode && !!parentViewStudentId)
      
      if (parentViewMode && parentViewStudentId) {
        // Fetch student name for display
        fetch(`/api/student/profile/${parentViewStudentId}`)
          .then(res => res.json())
          .then(data => {
            if (data.profile) {
              setStudentName(`${data.profile.firstName} ${data.profile.lastName}`)
            }
          })
          .catch(err => console.error('Error fetching student name:', err))
      }
    }
    
    checkParentView()
  }, [])

  const handleBackToParentDashboard = () => {
    // Clear parent view cookies
    fetch('/api/parent/logout-student-view', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      router.push('/parent/dashboard')
    })
  }

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
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
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
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="mb-8">
              {isParentView && (
                <Button 
                  onClick={handleBackToParentDashboard}
                  variant="outline"
                  className="mb-4 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Parent Dashboard</span>
                </Button>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isParentView ? `Editing: ${studentName}` : 'Edit Profile'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isParentView 
                  ? 'You have full access to view and edit your child\'s profile'
                  : 'Update your profile information to help others get to know you better'
                }
              </p>
            </div>
            <ProfileEditForm 
              userId={user?.id || ''} 
              initialSection={searchParams.get('section') || undefined}
              isParentView={isParentView}
            />
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <ProtectedLayout>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <InternalNavbar />
          <main className="flex-grow pt-16 sm:pt-24 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pathpiper-teal"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedLayout>
    }>
      <ProfileEditContent />
    </Suspense>
  )
}
