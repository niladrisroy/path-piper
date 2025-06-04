
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function StudentProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

    // Redirect students to their own profile with handle
    router.push(`/student/profile/${user.id}`)
  }, [user, loading, router])

  // This component will redirect, so we don't need to render anything else
  return null
}
