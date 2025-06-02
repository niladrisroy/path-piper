
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
    const checkAuthAndResolveParams = async () => {
      try {
        console.log('🔍 [STUDENT PROFILE DEBUG] Starting authentication check...')
        console.log('🔍 [STUDENT PROFILE DEBUG] Current URL:', window.location.href)
        console.log('🔍 [STUDENT PROFILE DEBUG] Current pathname:', window.location.pathname)
        
        // DEBUG: Check cookies and session accessibility
        console.log('🍪 [COOKIE DEBUG] Document cookies:', document.cookie)
        
        // Check for specific Supabase cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        console.log('🍪 [COOKIE DEBUG] Parsed cookies:', cookies)
        const authCookieKeys = Object.keys(cookies).filter(key => 
          key.includes('sb-') || key.includes('supabase') || key.includes('auth')
        )
        console.log('🍪 [COOKIE DEBUG] Supabase auth cookie keys:', authCookieKeys)
        
        authCookieKeys.forEach(key => {
          console.log(`🍪 [COOKIE DEBUG] ${key}: ${cookies[key] ? 'EXISTS' : 'MISSING'}`)
        })

        // Check localStorage for Supabase session
        if (typeof window !== 'undefined') {
          console.log('💾 [LOCALSTORAGE DEBUG] LocalStorage keys:', Object.keys(localStorage))
          const supabaseKeys = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('sb-')
          )
          console.log('💾 [LOCALSTORAGE DEBUG] Supabase localStorage keys:', supabaseKeys)
          
          supabaseKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key)
              const parsedValue = value ? JSON.parse(value) : value
              console.log(`💾 [LOCALSTORAGE DEBUG] ${key}:`, parsedValue)
              
              // If it's the session, log more details
              if (key.includes('session') && parsedValue) {
                console.log(`💾 [SESSION DEBUG] Session expires at:`, parsedValue.expires_at)
                console.log(`💾 [SESSION DEBUG] Session user ID:`, parsedValue.user?.id)
                console.log(`💾 [SESSION DEBUG] Access token exists:`, !!parsedValue.access_token)
                console.log(`💾 [SESSION DEBUG] Refresh token exists:`, !!parsedValue.refresh_token)
              }
            } catch (e) {
              const rawValue = localStorage.getItem(key)
              console.log(`💾 [LOCALSTORAGE DEBUG] ${key} (raw):`, rawValue)
            }
          })
        }

        // Check for auth cookies first (similar to ProtectedLayout)
        const hasAuthCookie = document.cookie.includes('sb-access-token') || 
                             document.cookie.includes('sb:token') || 
                             document.cookie.includes('sb-auth-token') ||
                             document.cookie.includes('supabase')

        console.log('🔒 [AUTH DEBUG] Has auth cookie:', hasAuthCookie)

        if (!hasAuthCookie) {
          console.error("❌ [REDIRECT] Student Profile: No auth cookies found, redirecting to login")
          router.push("/login")
          return
        }

        // Check current session with Supabase
        console.log('🔍 [SUPABASE DEBUG] Checking Supabase session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('🔍 [SUPABASE DEBUG] Session data:', session)
        console.log('🔍 [SUPABASE DEBUG] Session error:', sessionError)
        
        if (sessionError) {
          console.error("❌ [REDIRECT] Student Profile: Session error:", sessionError)
          router.push("/login")
          return
        }
        
        if (!session) {
          console.error("❌ [REDIRECT] Student Profile: No valid session found, redirecting to login")
          router.push("/login")
          return
        }

        console.log("✅ [AUTH SUCCESS] Student Profile: Valid session found for user:", session.user.id)
        console.log("✅ [AUTH SUCCESS] Session expires at:", session.expires_at)
        console.log("✅ [AUTH SUCCESS] User email:", session.user.email)

        // First resolve searchParams
        console.log('📄 [PARAMS DEBUG] Resolving search params...')
        const params = await searchParams
        const resolvedStudentId = params?.id
        setStudentId(resolvedStudentId)
        console.log('📄 [PARAMS DEBUG] Resolved student ID:', resolvedStudentId)

        console.log('🌐 [API DEBUG] Making request to /api/auth/user...')
        console.log('🌐 [API DEBUG] Request URL:', `${window.location.origin}/api/auth/user`)
        
        // Fetch user profile to determine role
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        console.log('🌐 [API DEBUG] Response status:', response.status)
        console.log('🌐 [API DEBUG] Response ok:', response.ok)
        console.log('🌐 [API DEBUG] Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          console.error(`❌ [REDIRECT] Student Profile: API request failed with status ${response.status}, redirecting to login`)
          
          // Try to read the response body for more details
          try {
            const errorText = await response.text()
            console.error('❌ [API ERROR] Response body:', errorText)
          } catch (e) {
            console.error('❌ [API ERROR] Could not read error response body')
          }
          
          router.push("/login")
          return
        }
        
        let userData
        try {
          userData = await response.json()
          console.log('🌐 [API DEBUG] User data response:', userData)
          console.log('🌐 [API DEBUG] User data success:', userData.success)
          console.log('🌐 [API DEBUG] User role:', userData.user?.role)
          console.log('🌐 [API DEBUG] Onboarding completed:', userData.onboardingCompleted)
        } catch (parseError) {
          console.error('❌ [API ERROR] Failed to parse JSON response:', parseError)
          router.push("/login")
          return
        }
        
        if (userData.success) {
          console.log('✅ [AUTH SUCCESS] User authentication successful')
          console.log('✅ [AUTH SUCCESS] User role:', userData.user.role)
          console.log('✅ [AUTH SUCCESS] User ID:', userData.user.id)
          console.log('✅ [AUTH SUCCESS] Onboarding completed:', userData.onboardingCompleted)
          
          // Check if onboarding is completed
          if (!userData.onboardingCompleted) {
            console.log('🔄 [REDIRECT] Student Profile: Onboarding not completed, redirecting based on role...')
            if (userData.user.role === 'mentor') {
              console.log('🔄 [REDIRECT] Mentor user -> /mentor-onboarding')
              router.push('/mentor-onboarding')
            } else if (userData.user.role === 'institution') {
              console.log('🔄 [REDIRECT] Institution user -> /institution-onboarding')
              router.push('/institution-onboarding')
            } else {
              console.log('🔄 [REDIRECT] Student user -> /onboarding')
              router.push('/onboarding')
            }
            return
          }
          
          console.log('✅ [AUTH SUCCESS] Onboarding completed, proceeding...')
          setCurrentUser(userData.user)

          // If no studentId is provided, check user role and redirect accordingly
          if (!resolvedStudentId) {
            console.log('🔍 [ROLE CHECK] No studentId provided, checking user role for redirect...')
            switch (userData.user.role) {
              case 'mentor':
                console.log('🔄 [REDIRECT] Mentor accessing student profile page -> /mentor/profile')
                router.push('/mentor/profile')
                return
              case 'institution':
                console.log('🔄 [REDIRECT] Institution accessing student profile page -> /institution/profile')
                router.push('/institution/profile')
                return
              case 'student':
                console.log('✅ [STAY] Student user on student profile page - staying')
                // Stay on this page, will show current user's profile
                break
              default:
                console.error('❌ [ERROR] Unknown role detected:', userData.user.role)
                console.log('🔄 [REDIRECT] Unknown role -> /login')
                router.push("/login")
                return
            }
          } else {
            console.log('🔍 [ROLE CHECK] StudentId provided:', resolvedStudentId)
            console.log('🔍 [ROLE CHECK] Will show profile for student ID:', resolvedStudentId)
          }
        } else {
          console.error('❌ [REDIRECT] User authentication failed:', userData.error)
          router.push("/login")
          return
        }
        
        console.log('🎉 [SUCCESS] Student profile page setup completed successfully')
        console.log('🎉 [SUCCESS] Current user set:', userData.user.id)
        console.log('🎉 [SUCCESS] Student ID for profile:', resolvedStudentId || 'current user')
        console.log('=== END STUDENT PROFILE DEBUGGING ===')
        
        setLoading(false)
      } catch (error) {
        console.error('💥 [FATAL ERROR] Error in auth check:', error)
        console.error('💥 [FATAL ERROR] Error stack:', error.stack)
        console.error('💥 [FATAL ERROR] Error name:', error.name)
        console.error('💥 [FATAL ERROR] Error message:', error.message)
        console.log('🔄 [REDIRECT] Fatal error -> /login')
        router.push("/login")
      }
    }

    checkAuthAndResolveParams()
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
