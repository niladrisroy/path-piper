import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginUser } from '@/lib/services/auth-service';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Check if this email belongs to a parent first
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { email: email }
    });

    if (parentProfile) {
      console.log('🔍 Parent login detected for:', email);
      
      // Handle parent login
      if (!parentProfile.auth_id) {
        return NextResponse.json({
          success: false,
          error: 'Parent account not fully set up. Please complete registration first.',
          isParent: true
        }, { status: 400 });
      }

      if (!parentProfile.emailVerified) {
        // Resend verification email if needed
        try {
          const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
          
          await prisma.parentProfile.update({
            where: { id: parentProfile.id },
            data: { verificationToken }
          });

          const baseUrl = 'https://pathpiper.replit.app';
          const verificationLink = `${baseUrl}/api/parent/verify-email?token=${verificationToken}`;
          
          const { sendEmail } = await import('@/lib/email');
          await sendEmail(
            'parent-email-verification',
            email,
            {
              parentName: parentProfile.name,
              verificationLink: verificationLink
            }
          );
          console.log('📧 Parent verification email resent successfully');
        } catch (emailError) {
          console.error('❌ Failed to send parent verification email:', emailError);
        }

        return NextResponse.json({
          success: false,
          error: 'Your email is not verified. We have sent an email for verification. Please click the link and verify to proceed with login.',
          needsVerification: true,
          isParent: true
        }, { status: 403 });
      }

      // Authenticate parent with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError || !authData.user) {
        return NextResponse.json({
          success: false,
          error: 'Invalid credentials',
          isParent: true
        }, { status: 401 });
      }

      // Set parent authentication cookies
      const cookieStore = await cookies();
      cookieStore.set('parent_session', authData.session?.access_token || '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      cookieStore.set('parent_id', parentProfile.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      console.log('✅ Parent login successful through main login');

      return NextResponse.json({
        success: true,
        isParent: true,
        parentId: parentProfile.id.toString(),
        parentName: parentProfile.name,
        redirectTo: '/parent/dashboard'
      });
    }

    // If not a parent, proceed with regular user login
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

      // Check if user has minimum required information for all three essential sections
      let needsOnboarding = false;

      if (result.role === 'student') {
        try {
          // Import prisma at the top of the file if not already imported
          const { prisma } = await import('@/lib/prisma');

          // Get complete student profile with all required data
          const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: result.user.id },
            include: {
              profile: {
                include: {
                  userInterests: true,
                }
              },
              educationHistory: true
            }
          });

          if (studentProfile) {
            // Check 1: Personal Information (first name, last name, bio)
            const hasBasicInfo = studentProfile.profile.firstName && 
                               studentProfile.profile.lastName && 
                               studentProfile.profile.bio;

            // Check 2: Interests (at least one interest)
            const hasInterests = studentProfile.profile.userInterests && 
                               studentProfile.profile.userInterests.length > 0;

            // Check 3: Education History (at least one education entry)
            const hasEducation = studentProfile.educationHistory && 
                               studentProfile.educationHistory.length > 0;

            // Only redirect to profile if ALL THREE sections have data
            needsOnboarding = !hasBasicInfo || !hasInterests || !hasEducation;

            console.log('Login onboarding check:', {
              hasBasicInfo,
              hasInterests,
              hasEducation,
              needsOnboarding
            });
          } else {
            // No student profile found, definitely needs onboarding
            needsOnboarding = true;
          }
        } catch (error) {
          console.error('Error checking student profile completeness:', error);
          // If there's an error checking, err on the side of caution and require onboarding
          needsOnboarding = true;
        }
      }

      const response = NextResponse.json({
        success: true,
        role: result.role,
        onboardingCompleted: !needsOnboarding,
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
          secure: true, // Always secure for production
          sameSite: 'lax',
          maxAge: result.session.expires_in || 3600, // Use session expiry or 1 hour
          path: '/',
        });

        // Set refresh token cookie
        response.cookies.set('sb-refresh-token', result.session.refresh_token, {
          httpOnly: true,
          secure: true, // Always secure for production
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
          path: '/',
        });

        // Set user ID cookie for easy access
        response.cookies.set('sb-user-id', result.user.id, {
          httpOnly: true,
          secure: true, // Always secure for production
          sameSite: 'lax',
          maxAge: result.session.expires_in || 3600,
          path: '/',
        });

        console.log('Login API - Cookies set successfully');
        console.log("API: Cookies set successfully - access token length:", result.session.access_token.length);
      } else {
        console.warn('Login API - No session data available to set cookies');
      }

      return response;
    }

    // Check if it's a verification error and return appropriate status
    if (result.error && (result.error.includes('parent verify') || result.error.includes('email verify'))) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          needsParentApproval: result.needsParentApproval || false,
          needsEmailVerification: result.needsEmailVerification || false
        },
        { status: 403 } // Forbidden - different from 401 unauthorized
      );
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