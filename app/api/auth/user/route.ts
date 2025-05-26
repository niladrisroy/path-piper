import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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
                  ageGroup: userProfile.student.ageGroup,
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

export async function PUT(request: NextRequest) {
  try {
    // Get the auth token from headers or cookies
    const authHeader = request.headers.get('Authorization');
    const cookieString = request.headers.get('cookie') || '';

    // Parse cookies properly
    const cookies = Object.fromEntries(
      cookieString.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return [name, decodeURIComponent(rest.join('='))];
      })
    );

    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Look for Supabase session cookies
      const sbAuthTokens = Object.keys(cookies).filter(key => 
        key.startsWith('sb-') && key.includes('auth-token')
      );

      for (const cookieName of sbAuthTokens) {
        try {
          const cookieValue = cookies[cookieName];
          if (cookieValue.startsWith('[') || cookieValue.startsWith('{')) {
            const parsed = JSON.parse(cookieValue);
            if (parsed && parsed.access_token) {
              token = parsed.access_token;
              break;
            }
          } else if (cookieValue.includes('.')) {
            token = cookieValue;
            break;
          }
        } catch (parseError) {
          continue;
        }
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', message: 'No valid token found' },
        { status: 401 }
      );
    }

    // Verify the user's session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Get user profile from database with student profile data if applicable
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        role: true,
        profileImageUrl: true,
        student: {
          select: {
            birthMonth: true,
            birthYear: true,
            educationLevel: true,
          }
        }
      }
    });

    if (!profile) {
      console.log("API: User profile not found in database");
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("API: User profile found in database");
    console.log("API: Student profile data:", profile.student);

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || "",
        location: profile.location || "",
        role: profile.role,
        profileImage: profile.profileImageUrl,
        birthMonth: profile.student?.birthMonth || "",
        birthYear: profile.student?.birthYear || "",
        educationLevel: profile.student?.educationLevel || "",
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}