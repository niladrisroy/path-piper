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

    console.log('Login API - Result success:', result.success);
    console.log('Login API - User ID:', result.user?.id);
    console.log('Login API - Session exists:', !!result.session);

    // If login successful, set session cookie
    if (result.success && result.user) {
      console.log('Login API - Setting up session cookies...');

      // Log the complete session object
      if (result.session) {
        console.log('Login API - Session access_token preview:', result.session.access_token?.substring(0, 20) + '...');
        console.log('Login API - Session refresh_token preview:', result.session.refresh_token?.substring(0, 20) + '...');
        console.log('Login API - Session expires_at:', result.session.expires_at);
        console.log('Login API - Session expires_in:', result.session.expires_in);
      }

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        role: result.role,
        onboardingCompleted: result.onboardingCompleted,
        userId: result.user.id,
        email: result.user.email,
        name: `${result.user.user_metadata?.first_name || ''} ${result.user.user_metadata?.last_name || ''}`.trim()
      });

      // Set session cookies manually using Supabase session data
      if (result.session) {
        console.log('Login API - Setting Supabase session cookies...');

        // Set access token cookie (this is what we'll use for API calls)
        response.cookies.set('sb-access-token', result.session.access_token, {
          httpOnly: true,
          secure: false, // Set to false for local development
          sameSite: 'lax',
          maxAge: result.session.expires_in || 3600, // Use session expiry or 1 hour
          path: '/',
        });

        // Set refresh token cookie
        response.cookies.set('sb-refresh-token', result.session.refresh_token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
          path: '/',
        });

        // Set user ID cookie for easy access
        response.cookies.set('sb-user-id', result.user.id, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: result.session.expires_in || 3600,
          path: '/',
        });

        console.log('Login API - Cookies set successfully');
      } else {
        console.warn('Login API - No session data available to set cookies');
      }

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
```