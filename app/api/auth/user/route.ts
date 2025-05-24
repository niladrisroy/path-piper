
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the auth cookie from the headers
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
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
    
    // Get the user's profile from Prisma
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
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
