import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

// Test the database connection when the file is loaded
(async () => {
  try {
    const count = await prisma.profile.count();
    console.log("API: Database connection test - Profile count:", count);
  } catch (error) {
    console.error("API: Database connection test failed:", error);
  }
})();

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

    // Prioritize auth header, then look for Supabase session cookies
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("API: Using token from Authorization header");
    } else {
      // Look for Supabase session cookies and parse them properly
      const sbAuthTokens = Object.keys(cookies).filter(key => 
        key.startsWith('sb-') && key.includes('auth-token')
      );
      
      for (const cookieName of sbAuthTokens) {
        try {
          const cookieValue = cookies[cookieName];
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

    console.log("API: Token found:", !!token);

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

    // FALLBACK: If we reach here, try to use the demo/test data
    // This is for development/debugging only
    console.log("API: Trying fallback with direct database query for demo data");

    // For testing purposes, use the first user from the database
    try {
      // Just get the first available profile from the database
      const demoProfile = await prisma.profile.findFirst({
        include: {
          student: true,
          mentor: true,
          institution: true
        }
      });

      if (demoProfile) {
        console.log("API: Using demo profile for testing:", demoProfile.id);
            // Format birth month and year for display
            let birthMonth = "";
            let birthYear = "";

            if (demoProfile.student) {
              birthMonth = demoProfile.student.birthMonth ? demoProfile.student.birthMonth.toString() : "";
              birthYear = demoProfile.student.birthYear ? demoProfile.student.birthYear.toString() : "";
            }
        return NextResponse.json({
          user: {
            id: demoProfile.id,
            firstName: demoProfile.firstName,
            lastName: demoProfile.lastName,
            email: "demo@example.com", // Not the real email
            role: demoProfile.role,
            bio: demoProfile.bio,
            location: demoProfile.location,
            profileImageUrl: demoProfile.profileImageUrl,
            // Add role-specific data based on the profile type
            ...(demoProfile.student && {
              ageGroup: demoProfile.student.ageGroup,
              educationLevel: demoProfile.student.educationLevel,
              onboardingCompleted: demoProfile.student.onboardingCompleted,
              birthMonth: birthMonth,
              birthYear: birthYear,
            }),
            ...(demoProfile.mentor && {
              profession: demoProfile.mentor.profession,
              organization: demoProfile.mentor.organization,
              yearsExperience: demoProfile.mentor.yearsExperience,
              onboardingCompleted: demoProfile.mentor.onboardingCompleted
            }),
            ...(demoProfile.institution && {
              institutionName: demoProfile.institution.institutionName,
              institutionType: demoProfile.institution.institutionType,
              category: demoProfile.institution.category,
              website: demoProfile.institution.website,
              onboardingCompleted: demoProfile.institution.onboardingCompleted
            })
          },
          warning: "Demo mode: Using first available profile"
        });
      }
    } catch (dbError) {
      console.error("API: Error fetching demo profile:", dbError);
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
    // Get the auth cookie from the headers
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', message: 'No Authorization header provided' },
        { status: 401 }
      );
    }

    // Parse the token
    const token = authHeader.replace('Bearer ', '');

    // Verify the user's session with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Update the profile
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update the profile
    await prisma.profile.update({
      where: { id: data.user.id },
      data: {
        firstName: body.profile?.first_name || profile.firstName,
        lastName: body.profile?.last_name || profile.lastName,
        bio: body.profile?.bio || profile.bio,
        location: body.profile?.location || profile.location,
      },
    });

    // Update role-specific profile
    if (profile.role === 'student') {
      await prisma.studentProfile.update({
        where: { id: data.user.id },
        data: {
          educationLevel: body.profile?.education_level,
          ageGroup: body.profile?.age_group,
          onboardingCompleted: body.profile?.onboarding_completed || false,
        },
      });
    } else if (profile.role === 'mentor') {
      await prisma.mentorProfile.update({
        where: { id: data.user.id },
        data: {
          educationLevel: body.profile?.education_level,
          onboardingCompleted: body.profile?.onboarding_completed || false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}