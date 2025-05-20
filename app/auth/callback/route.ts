import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase-types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)

    // If this is a password recovery, redirect to reset password page
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", request.url))
    }

    // Check if user has a profile
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      // If no profile exists, redirect to signup page to complete profile
      if (!profile) {
        return NextResponse.redirect(new URL("/signup", request.url))
      }

      // If profile exists but onboarding not completed, redirect to appropriate onboarding
      if (profile.role === "student" && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      } else if (profile.role === "mentor" && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/mentor-onboarding", request.url))
      } else if (profile.role === "institution" && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/institution-onboarding", request.url))
      }

      // Otherwise redirect to feed
      return NextResponse.redirect(new URL("/feed", request.url))
    }
  }

  // Default redirect to home page
  return NextResponse.redirect(new URL("/", request.url))
}
