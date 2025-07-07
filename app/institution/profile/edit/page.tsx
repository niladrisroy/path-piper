
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import InstitutionNavbar from "@/components/institution-navbar"
import Footer from "@/components/footer"
import ProtectedLayout from "../../../protected-layout"
import { getCurrentUserInstitution } from "@/lib/db/institution"
import InstitutionEditForm from "@/components/profile/institution-edit-form"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata: Metadata = {
  title: "Edit Institution Profile | PathPiper",
  description: "Edit your institution profile on PathPiper"
}

export default async function InstitutionProfileEditPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  
  if (!token) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser(token)
  
  if (!user) {
    redirect('/login')
  }

  const institution = await getCurrentUserInstitution(user.id)
  
  if (!institution) {
    redirect('/institution-onboarding')
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <InstitutionNavbar />
        <main className="flex-1 pt-16 sm:pt-24 pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Institution Profile</h1>
              <p className="text-gray-600 mt-2">
                Update your institution information to help students learn more about you
              </p>
            </div>
            <InstitutionEditForm institutionData={institution} />
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedLayout>
  )
}
