
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginUser } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call login service
    const result = await loginUser({ email, password });

    // If login successful, set session cookie
    if (result.success && result.user) {
      // Set the auth cookie manually to ensure it's properly set
      const response = NextResponse.json({
        success: true,
        role: result.role,
        onboardingCompleted: result.onboardingCompleted,
        userId: result.user.id,
        email: result.user.email,
        name: `${result.user.user_metadata?.first_name || ''} ${result.user.user_metadata?.last_name || ''}`.trim()
      });
      
      // Set cookie for authentication
      response.cookies.set('sb-auth-token', result.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Login failed' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
