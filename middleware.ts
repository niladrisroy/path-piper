
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define paths that should be protected (require authentication)
  const protectedPaths = [
    '/onboarding',
    '/feed',
    '/explore',
    '/immersive-feed',
    '/profile',
    '/student',
    '/mentor',
    '/institution',
  ];
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/signup', '/forgot-password', '/api'];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );
  
  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );
  
  // If it's a protected path, check for authentication
  if (isProtectedPath && !isPublicPath) {
    // Get the auth cookie to check if the user is logged in
    // Check both possible cookie names that Supabase might use
    const hasAuthCookie = request.cookies.has('sb-auth-token') || 
                         request.cookies.has('sb:token') || 
                         request.cookies.has('sb-access-token') ||
                         request.cookies.has('supabase-auth-token');
    
    console.log('Cookie check in middleware:', {
      path,
      hasAuthCookie,
      cookies: Array.from(request.cookies.getAll()).map(c => c.name)
    });
    
    // If no auth cookie, redirect to login
    if (!hasAuthCookie) {
      // Create the redirect URL with the original destination as 'from' parameter
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      
      // Preserve any existing redirectURL parameter if it exists in the original request
      const originalRedirectURL = request.nextUrl.searchParams.get('redirectURL');
      if (originalRedirectURL) {
        redirectUrl.searchParams.set('redirectURL', originalRedirectURL);
      }
      
      // Log the redirect for debugging
      console.log(`Redirecting unauthenticated request from ${path} to ${redirectUrl.toString()}`);
      
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Continue to the route if authenticated or not a protected path
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
