import type { Metadata } from "next"
import MentorProfile from "@/components/profile/mentor-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../protected-layout"

export const metadata: Metadata = {
  title: "Mentor Profile | PathPiper",
  description: "View and manage your mentor profile on PathPiper",
}

export default function MentorProfilePage({
  searchParams,
}: {
  searchParams?: {
    id?: string
  }
}) {
  const mentorId = searchParams?.id

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-white">
        <InternalNavbar />
        <main className="pt-16 sm:pt-24">
          <MentorProfile mentorId={mentorId} />
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}