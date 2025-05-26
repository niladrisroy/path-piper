import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Database connection will be tested when actually needed

export async function GET(request: NextRequest) {
  console.log("API: User data request received");

  try {
    // Simplified approach: Try to get user directly from database
    // First try the cookie-based approach (for production)
    console.log("API: Checking cookies for auth token");

    // Try to get token from cookies or auth header
    const authHeader = request.headers.get('Authorization');
    const cookieString = request.headers.get('cookie') || '';

    // Parse cookies properly
    const cookies = Object.fromEntries(
      cookieString.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return [name, decodeURIComponent(rest.join('='))];
      })
    );

    console.log("API: Available cookies:", Object.keys(cookies).join(', '));

    // Log all available cookies for debugging
    console.log("API: Available cookies:", Object.keys(cookies));
    console.log("API: Looking for session cookies...");

    // Prioritize auth header, then look for our new session cookies
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("API: Using token from Authorization header");
    } else {
      // First try our new access token cookie
      if (cookies['sb-access-token']) {
        token = cookies['sb-access-token'];
        console.log("API: Using access token from sb-access-token cookie");
      } else {
        // Fallback to looking for other Supabase session cookies
        const sbAuthTokens = Object.keys(cookies).filter(key => 
          key.startsWith('sb-') && (key.includes('auth-token') || key.includes('access'))
        );

        console.log("API: Found potential auth cookies:", sbAuthTokens);

        for (const cookieName of sbAuthTokens) {
          try {
            const cookieValue = cookies[cookieName];
            console.log(`API: Checking cookie ${cookieName} (length: ${cookieValue?.length || 0})`);

            // Try to parse as JSON if it looks like a session object
            if (cookieValue.startsWith('[') || cookieValue.startsWith('{')) {
              const parsed = JSON.parse(cookieValue);
              if (parsed && parsed.access_token) {
                token = parsed.access_token;
                console.log(`API: Extracted access_token from ${cookieName}`);
                break;
              }
            } else if (cookieValue.includes('.')) {
              // If it looks like a JWT (has dots), use it directly
              token = cookieValue;
              console.log(`API: Using JWT token from ${cookieName}`);
              break;
            }
          } catch (parseError) {
            console.log(`API: Failed to parse cookie ${cookieName}:`, parseError.message);
          }
        }
      }
    }

    console.log("API: Token found:", !!token);
    if (token) {
      console.log("API: Token preview:", token.substring(0, 30) + "...");
    }

    if (token) {
      console.log("API: Token preview:", token.substring(0, 20) + "...");

      // Try to verify the token with Supabase
      console.log("API: Verifying token with Supabase");
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
          console.log("API: Supabase auth error:", authError.message);
          // Even if auth fails, try a direct query as fallback
        } else if (authData && authData.user) {
          console.log("API: Authenticated user found:", authData.user.id);

          // Query the database for the user profile
          const userProfile = await prisma.profile.findUnique({
            where: { id: authData.user.id },
            include: {
              student: true,
              mentor: true,
              institution: true
            }
          });

          if (userProfile) {
            console.log("API: User profile found in database");
            // Format birth month and year for display
            let birthMonth = "";
            let birthYear = "";

            if (userProfile.student) {
              birthMonth = userProfile.student.birthMonth ? userProfile.student.birthMonth.toString() : "";
              birthYear = userProfile.student.birthYear ? userProfile.student.birthYear.toString() : "";
            }
            return NextResponse.json({
              user: {
                id: userProfile.id,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: authData.user.email,
                role: userProfile.role,
                bio: userProfile.bio,
                location: userProfile.location,
                profileImageUrl: userProfile.profileImageUrl,
                // Add student-specific data if this is a student
                ...(userProfile.student && {
                  educationLevel: userProfile.student.educationLevel,
                  onboardingCompleted: userProfile.student.onboardingCompleted,
                  birthMonth: birthMonth,
                  birthYear: birthYear,
                }),
                // Add mentor-specific data if this is a mentor
                ...(userProfile.mentor && {
                  profession: userProfile.mentor.profession,
                  organization: userProfile.mentor.organization,
                  yearsExperience: userProfile.mentor.yearsExperience,
                  onboardingCompleted: userProfile.mentor.onboardingCompleted
                }),
                // Add institution-specific data if this is an institution
                ...(userProfile.institution && {
                  institutionName: userProfile.institution.institutionName,
                  institutionType: userProfile.institution.institutionType,
                  category: userProfile.institution.category,
                  website: userProfile.institution.website,
                  onboardingCompleted: userProfile.institution.onboardingCompleted
                })
              }
            });
          } else {
            console.log("API: User authenticated but no profile found");
          }
        }
      } catch (err) {
        console.error("API: Error verifying token:", err);
      }
    }

    // If we reach here, we couldn't authenticate or find any profile
    return NextResponse.json(
      { error: "Unauthorized or no profile found" },
      { status: 401 }
    );
  } catch (error) {
    console.error("API: Unexpected error in user route:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("API: Profile update request received");

    // Get the request body
    const body = await request.json();
    console.log("API: Update data:", body);

    // Get user from session cookie
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      console.log("API: No access token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log("API: Invalid token or user not found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("API: Authenticated user:", user.id);

    // Update profile in database
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio || null,
        location: body.location || null,
      }
    });

    console.log("API: Profile updated successfully");

    // If user is a student, also update student profile
    if (body.educationLevel) {
      await prisma.studentProfile.update({
        where: { id: user.id },
        data: {
          educationLevel: body.educationLevel,
        }
      });
      console.log("API: Student profile updated successfully");
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedProfile.id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}