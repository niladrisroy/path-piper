import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Basic middleware - just continue with the request
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