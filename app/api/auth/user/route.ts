
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the user ID from the auth cookie
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ 
        user: null,
        message: 'No active session found' 
      }, { status: 401 })
    }
    
    // Fetch user data from the database
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        student: true,
        mentor: true,
        institution: true,
      },
    })
    
    if (!profile) {
      return NextResponse.json({ 
        user: null,
        message: 'User profile not found' 
      }, { status: 404 })
    }
    
    // Get onboarding status from the included profile data
    let onboardingCompleted = false;
    
    if (profile.role === 'student' && profile.student) {
      onboardingCompleted = profile.student.onboardingCompleted || false;
    } else if (profile.role === 'mentor' && profile.mentor) {
      onboardingCompleted = profile.mentor.onboardingCompleted || false;
    } else if (profile.role === 'institution' && profile.institution) {
      onboardingCompleted = profile.institution.onboardingCompleted || false;
    }
    
    // Format the response for the frontend
    const userData = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      onboardingCompleted,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        location: profile.location,
        profileImageUrl: profile.profileImageUrl,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    }
    
    // Add role-specific data
    if (profile.role === 'student' && profile.student) {
      userData.profile.ageGroup = profile.student.ageGroup;
      userData.profile.educationLevel = profile.student.educationLevel;
      userData.profile.interests = profile.student.interests || [];
      userData.profile.skills = profile.student.skills || [];
      userData.profile.goals = profile.student.goals || [];
    } else if (profile.role === 'mentor' && profile.mentor) {
      userData.profile.profession = profile.mentor.profession;
      userData.profile.organization = profile.mentor.organization;
      userData.profile.verified = profile.mentor.verified;
    } else if (profile.role === 'institution' && profile.institution) {
      userData.profile.institutionName = profile.institution.institutionName;
      userData.profile.institutionType = profile.institution.institutionType;
      userData.profile.category = profile.institution.category;
      userData.profile.website = profile.institution.website;
    }
    
    return NextResponse.json({ user: userData })
    
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user data' 
    }, { status: 500 })
  }
}
