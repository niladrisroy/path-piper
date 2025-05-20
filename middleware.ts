
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the request is for the API
  if (path.startsWith('/api/')) {
    // Add custom headers
    const headers = new Headers(request.headers)
    headers.set('x-path-piper-version', '1.0')

    // You can add more middleware logic here
    // such as authentication, rate limiting, etc.

    return NextResponse.next({
      request: {
        headers: headers,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
