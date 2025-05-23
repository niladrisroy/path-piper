
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
      // The session is managed by Supabase Auth automatically
      return NextResponse.json({
        success: true,
        role: result.role,
        onboardingCompleted: result.onboardingCompleted
      });
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
