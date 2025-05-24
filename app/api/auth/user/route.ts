
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
  try {
    // Get the auth cookie from the headers
    const authHeader = request.headers.get('Authorization');
    
    console.log("API: Received auth request, header present:", !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', message: 'No Authorization header provided' },
        { status: 401 }
      );
    }
    
    // Parse the token
    const token = authHeader.replace('Bearer ', '');
    
    // Log token preview for debugging (first 10 chars only for security)
    console.log("API: Token preview:", token.substring(0, 10) + "...");
    
    // Verify the user's session with Supabase
    console.log("API: Verifying token with Supabase");
    
    const { data, error } = await supabase.auth.getUser(token);
      
    if (error) {
      console.error("API: Supabase auth error:", error.message);
      return NextResponse.json(
        { success: false, error: 'Invalid session', message: error.message },
        { status: 401 }
      );
    }
    
    if (!data || !data.user) {
      console.error("API: No user data returned from Supabase");
      return NextResponse.json(
        { success: false, error: 'No user data', message: 'User data not found' },
        { status: 401 }
      );
    }
    
    console.log("API: User authenticated successfully:", data.user.id);
    
    console.log("API: Fetching profile for user:", data.user.id);
    
    // Get the user's profile from Prisma
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
    });
    
    if (!profile) {
      console.error("API: Profile not found for user:", data.user.id);
      
      // Return basic user data even if profile not found
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          role: data.user.user_metadata?.role || 'student',
          onboardingCompleted: false
        }
      });
    }
    
    // Get role-specific profile data
    let roleProfile = null;
    if (profile.role === 'student') {
      roleProfile = await prisma.studentProfile.findUnique({
        where: { id: profile.id },
      });
    } else if (profile.role === 'mentor') {
      roleProfile = await prisma.mentorProfile.findUnique({
        where: { id: profile.id },
      });
    } else if (profile.role === 'institution') {
      roleProfile = await prisma.institutionProfile.findUnique({
        where: { id: profile.id },
      });
    }
    
    // Get age group if it's a student profile
    let ageGroup = 'young-adult';
    if (profile.role === 'student' && roleProfile) {
      ageGroup = roleProfile.ageGroup || 'young-adult';
    }

    // Log the data for debugging
    console.log("API response data:", {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      email: data.user.email,
      ageGroup,
      roleProfile
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role,
        email: data.user.email,
        ageGroup: ageGroup,
        educationLevel: roleProfile?.educationLevel || '',
        bio: profile.bio || '',
        location: profile.location || '',
        onboardingCompleted: roleProfile?.onboardingCompleted || false,
        profile: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          bio: profile.bio || '',
          location: profile.location || '',
          education_level: roleProfile?.educationLevel || '',
          age_group: ageGroup,
          onboarding_completed: roleProfile?.onboardingCompleted || false
        },
        ...roleProfile
      }
    });
    
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
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
