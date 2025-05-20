import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase-types"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient<Database>({ req, res })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = [
      "/feed",
      "/onboarding",
      "/student/profile",
      "/mentor/profile",
      "/institution/profile",
      "/explore",
      "/immersive-feed",
    ]

    // Check if the route is protected and user is not authenticated
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

    if (isProtectedRoute && !session) {
      // Redirect to login if trying to access protected route without authentication
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && session) {
      // Redirect to feed if already authenticated and trying to access auth routes
      return NextResponse.redirect(new URL("/feed", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error with Supabase, just continue to the page
    // This allows the app to function even if Supabase is not available
  }

  return res
}

// Only run middleware on specific routes
export const config = {
  matcher: [
    "/feed/:path*",
    "/onboarding/:path*",
    "/student/:path*",
    "/mentor/:path*",
    "/institution/:path*",
    "/explore/:path*",
    "/immersive-feed/:path*",
    "/login",
    "/signup",
  ],
}
