import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Clear the authentication cookies
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })

  // Get the host from the request
  const host = request.headers.get('host') || '';
  const isProduction = process.env.NODE_ENV === 'production' || host.includes('.repl.co');

  response.cookies.set('sb-access-token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
    domain: isProduction ? undefined : undefined
  })

  response.cookies.set('sb-refresh-token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
    domain: isProduction ? undefined : undefined
  })

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}