import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Database connection will be tested when actually needed

export async function GET(request: NextRequest) {
  try {
    console.log('API: User data request received')

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    const parentAuthId = request.cookies.get('parent-auth-id')?.value

    if (parentViewMode && parentViewStudentId && parentAuthId) {
      console.log('API: Parent view mode detected, returning student data')

      // Get student profile for parent view
      const studentProfile = await prisma.profile.findFirst({
        where: {
          id: parentViewStudentId,
          role: 'student'
        },
        include: {
          student: true
        }
      })

      if (studentProfile) {
        const userData = {
          id: studentProfile.id,
          firstName: studentProfile.firstName,
          lastName: studentProfile.lastName,
          email: studentProfile.email || '',
          role: 'student',
          bio: studentProfile.bio,
          location: studentProfile.location,
          profileImageUrl: studentProfile.profileImageUrl,
          isParentView: true, // Flag to indicate this is parent view
          parentAuthId: parentAuthId
        }

        return NextResponse.json({ user: userData })
      }
    }

    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    console.log('API: Checking cookies for auth token')
    console.log('API: Available cookies:', Object.keys(Object.fromEntries(request.cookies)))
    console.log('API: Available cookies:', [...request.cookies.keys()])

    if (!accessToken) {
      console.log('API: No access token found')
      return NextResponse.json(
        { error: 'No access token found' }, 
        { status: 401 }
      )
    }

    console.log("API: Token preview:", accessToken.substring(0, 20) + "...");

    // Verify token with Supabase
    console.log("API: Verifying token with Supabase");
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log("API: Supabase auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("API: Authenticated user found:", user.id);

    // Query the database for the user profile
    const userProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        mentor: true,
        institution: {
          include: {
            institutionType: true
          }
        }
      }
    });

    if (userProfile) {
      console.log("API: User profile found in database");
      console.log("API: Raw age_group from database:", userProfile.student?.age_group);
      // Format birth month and year for display
      let birthMonth = "";
      let birthYear = "";

      if (userProfile.student) {
        birthMonth = userProfile.student.birthMonth ? userProfile.student.birthMonth.toString() : "";
        birthYear = userProfile.student.birthYear ? userProfile.student.birthYear.toString() : "";
      }
      const responseData = {
        user: {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: user.email,
          role: userProfile.role,
          bio: userProfile.bio,
          location: userProfile.location,
          profileImageUrl: userProfile.profileImageUrl,
          // Add student-specific data if this is a student
          ...(userProfile.student && {
            educationLevel: userProfile.student.educationLevel,
            onboardingCompleted: userProfile.student.onboardingCompleted ?? true, // Default to true if null
            birthMonth: birthMonth,
            birthYear: birthYear,
            ageGroup: userProfile.student.age_group, // Return exactly as stored in DB
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
            institutionTypeId: userProfile.institution.institutionTypeId,
            website: userProfile.institution.website,
            onboardingCompleted: userProfile.institution.onboardingCompleted
          })
        }
      };
      return NextResponse.json(responseData);
    } else {
      console.log("API: User authenticated but no profile found");
    }
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

    // Get user from session cookie - properly await cookies() for NextJS 15
    const cookieStore = await cookies();
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

    // Extract profile data from the nested structure
    const profileData = body.profile || body;

    // Update profile data
    if (profileData) {
      console.log('Updating profile with data:', profileData);

      const profileUpdateData: any = {};
      if (profileData.firstName !== undefined) profileUpdateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) profileUpdateData.lastName = profileData.lastName;
      if (profileData.bio !== undefined) profileUpdateData.bio = profileData.bio;
      if (profileData.location !== undefined) profileUpdateData.location = profileData.location;
      if (profileData.tagline !== undefined) profileUpdateData.tagline = profileData.tagline;
      // Note: onboarding_completed field has been removed from Profile model
        // Onboarding completion is now determined by data presence for students
        // and stored in role-specific profile tables for mentors/institutions

      console.log('Profile update data being sent to database:', profileUpdateData);

      const updatedProfile = await prisma.profile.update({
        where: { id: user.id },
        data: profileUpdateData
      });

      console.log("API: Profile updated successfully");

      // If user is a student, also update student profile
      if (profileData.educationLevel || profileData.birthMonth || profileData.birthYear || profileData.ageGroup) {
      const studentUpdateData: any = {};

      if (profileData.educationLevel) {
        studentUpdateData.educationLevel = profileData.educationLevel;
      }
      if (profileData.birthMonth) {
        studentUpdateData.birthMonth = profileData.birthMonth;
      }
      if (profileData.birthYear) {
        studentUpdateData.birthYear = profileData.birthYear;
      }
      if (profileData.ageGroup) {
        studentUpdateData.age_group = profileData.ageGroup;
      }

      await prisma.studentProfile.update({
        where: { id: user.id },
        data: studentUpdateData
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
    }

    // If no profile data to update
    return NextResponse.json({
      success: false,
      error: 'No profile data provided'
    }, { status: 400 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}