
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
    const resolveParams = async () => {
      try {
        // DEBUG: Check cookies and session accessibility
        console.log('=== DEBUGGING STUDENT PROFILE PAGE ===')
        console.log('Document cookies:', document.cookie)
        
        // Check for specific Supabase cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        console.log('Parsed cookies:', cookies)
        console.log('Supabase auth cookies:', Object.keys(cookies).filter(key => 
          key.includes('sb-') || key.includes('supabase') || key.includes('auth')
        ))

        // Check localStorage for Supabase session
        if (typeof window !== 'undefined') {
          console.log('LocalStorage keys:', Object.keys(localStorage))
          const supabaseKeys = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('sb-')
          )
          console.log('Supabase localStorage keys:', supabaseKeys)
          
          supabaseKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key)
              console.log(`${key}:`, value ? JSON.parse(value) : value)
            } catch (e) {
              console.log(`${key} (raw):`, localStorage.getItem(key))
            }
          })
        }

        // First resolve searchParams
        const params = await searchParams
        const resolvedStudentId = params?.id
        setStudentId(resolvedStudentId)

        console.log('Making request to /api/auth/user...')
        // Fetch user profile to determine role (authentication is already handled by ProtectedLayout)
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        const userData = await response.json()
        console.log('User data response:', userData)
        
        if (userData.success) {
          console.log('✅ User authentication successful')
          console.log('User role:', userData.user.role)
          console.log('User ID:', userData.user.id)
          setCurrentUser(userData.user)

          // If no studentId is provided, check user role and redirect accordingly
          if (!resolvedStudentId) {
            console.log('No studentId provided, checking user role for redirect...')
            switch (userData.user.role) {
              case 'mentor':
                console.log('Redirecting to mentor profile')
                router.push('/mentor/profile')
                return
              case 'institution':
                console.log('Redirecting to institution profile')
                router.push('/institution/profile')
                return
              case 'student':
                console.log('User is student, staying on this page')
                // Stay on this page, will show current user's profile
                break
              default:
                console.log('Unknown role, this should not happen')
                // This shouldn't happen since ProtectedLayout handles auth
                break
            }
          } else {
            console.log('StudentId provided:', resolvedStudentId)
          }
        } else {
          console.log('❌ User authentication failed:', userData.error)
        }
        
        console.log('=== END DEBUGGING ===')
        setLoading(false)
      } catch (error) {
        console.error('Error resolving params:', error)
        setLoading(false)
      }
    }

    resolveParams()
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
