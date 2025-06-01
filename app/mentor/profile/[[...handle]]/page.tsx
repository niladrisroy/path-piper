
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import MentorProfile from "@/components/profile/mentor-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../../protected-layout"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const metadata: Metadata = {
  title: "Mentor Profile | PathPiper",
  description: "View and manage your mentor profile on PathPiper",
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

async function getMentorByHandle(handle: string) {
  try {
    const mentor = await prisma.mentorProfile.findFirst({
      where: {
        userHandle: handle,
      },
      include: {
        profile: true,
      },
    })
    return mentor
  } catch (error) {
    console.error('Error getting mentor by handle:', error)
    return null
  }
}

export default async function MentorProfilePage({
  params,
}: {
  params: { handle?: string[] }
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/login')
  }

  if (currentUser.role === 'student') {
    redirect('/student/profile')
  } else if (currentUser.role === 'institution') {
    redirect('/institution/profile')
  }

  const handle = params.handle?.[0]
  let targetMentorId: string | undefined
  let isOwnProfile = false

  if (handle) {
    const targetMentor = await getMentorByHandle(handle)
    if (!targetMentor) {
      redirect('/mentor/profile')
    }
    targetMentorId = targetMentor.id
    isOwnProfile = targetMentorId === currentUser.id
  } else {
    if (currentUser.role !== 'mentor') {
      redirect(`/${currentUser.role}/profile`)
    }
    targetMentorId = currentUser.id
    isOwnProfile = true
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        <InternalNavbar />
        <main className="pt-16 sm:pt-24">
          <MentorProfile 
            mentorId={targetMentorId} 
            isOwnProfile={isOwnProfile}
          />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
