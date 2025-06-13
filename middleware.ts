
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define paths that should be protected
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
  
  // Define public paths
  const publicPaths = ['/login', '/register', '/signup', '/forgot-password', '/api'];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );
  
  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );
  
  // If it's a protected path, validate authentication properly
  if (isProtectedPath && !isPublicPath) {
    // Try multiple cookie names that Supabase might use
    const accessToken = request.cookies.get('sb-access-token')?.value || 
                       request.cookies.get('supabase-auth-token')?.value ||
                       request.cookies.get('sb-auth-token')?.value;
    
    if (!accessToken) {
      // No token, redirect to login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Verify token with Supabase
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (error || !user) {
        // Invalid token, redirect to login
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('from', path);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Token is valid, inject user info into headers for the app to use
      const response = NextResponse.next();
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-email', user.email || '');
      return response;
      
    } catch (error) {
      console.error('Middleware auth error:', error);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
