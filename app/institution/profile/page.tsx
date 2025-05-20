import type { Metadata } from "next"
import InstitutionProfile from "@/components/profile/institution-profile"
import InternalNavbar from "@/components/internal-navbar"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Stanford University | PathPiper",
  description: "Stanford University profile on PathPiper - Connecting students with educational opportunities",
}

export default function InstitutionProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <InternalNavbar />
      <main className="pt-16 sm:pt-24">
        <InstitutionProfile />
      </main>
      <Footer />
    </div>
  )
}
