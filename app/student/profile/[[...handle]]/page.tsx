
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../../protected-layout"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const metadata: Metadata = {
  title: "Student Profile | PathPiper",
  description: "View and manage your educational journey, skills, and achievements",
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) return null

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) return null

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        mentor: true,
        institution: true,
      },
    })

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

async function getStudentByHandle(handle: string) {
  try {
    const student = await prisma.studentProfile.findFirst({
      where: {
        userHandle: handle,
      },
      include: {
        profile: true,
      },
    })
    return student
  } catch (error) {
    console.error('Error getting student by handle:', error)
    return null
  }
}

export default async function StudentProfilePage({
  params,
}: {
  params: { handle?: string[] }
}) {
  const currentUser = await getCurrentUser()
  
  // If no user is logged in, redirect to login
  if (!currentUser) {
    redirect('/login')
  }

  // Check if current user is trying to access wrong profile type
  if (currentUser.role === 'mentor') {
    redirect('/mentor/profile')
  } else if (currentUser.role === 'institution') {
    redirect('/institution/profile')
  }

  const handle = params.handle?.[0]
  let targetStudentId: string | undefined
  let isOwnProfile = false

  if (handle) {
    // Viewing someone else's profile by handle
    const targetStudent = await getStudentByHandle(handle)
    if (!targetStudent) {
      // Handle not found, redirect to own profile
      redirect('/student/profile')
    }
    targetStudentId = targetStudent.id
    isOwnProfile = targetStudentId === currentUser.id
  } else {
    // No handle provided, show own profile
    if (currentUser.role !== 'student') {
      // Non-student trying to access student profile without handle
      redirect(`/${currentUser.role}/profile`)
    }
    targetStudentId = currentUser.id
    isOwnProfile = true
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col">
        <InternalNavbar />
        <main className="flex-grow pt-16 sm:pt-24">
          <StudentProfile 
            studentId={targetStudentId} 
            isOwnProfile={isOwnProfile}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
