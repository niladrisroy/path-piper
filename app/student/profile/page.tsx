import type { Metadata } from "next"
import StudentProfile from "@/components/profile/student-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Student Profile | PathPiper",
  description: "View and manage your educational journey, skills, and achievements",
}

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string
  }>
}) {
  const { id: studentId } = await searchParams

  return (
    <div className="min-h-screen flex flex-col">
      <InternalNavbar />
      <main className="flex-grow pt-16 sm:pt-24">
        <StudentProfile studentId={studentId} />
      </main>
      <Footer />
    </div>
  )
}
