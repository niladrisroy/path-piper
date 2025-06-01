
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedLayout from "../protected-layout"
import StudentProfile from "@/components/profile/student-profile"
import MentorProfile from "@/components/profile/mentor-profile"
import InstitutionProfile from "@/components/profile/institution-profile"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface UserData {
  id: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'institution'
  email: string
  bio?: string
  location?: string
  profileImageUrl?: string
  student?: any
  mentor?: any
  institution?: any
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/user')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.message || 'Failed to load profile')
        return
      }
      
      setUserData(data.user)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    )
  }

  if (!userData) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No profile data found. Please complete your profile setup.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      {userData.role === 'student' && <StudentProfile userData={userData} />}
      {userData.role === 'mentor' && <MentorProfile userData={userData} />}
      {userData.role === 'institution' && <InstitutionProfile userData={userData} />}
    </ProtectedLayout>
  )
}
