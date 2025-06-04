
import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, updateStudentProfile } from '@/lib/db/profile'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Format the response to match the expected structure
    const formattedProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      location: profile.location,
      tagline: profile.tagline,
      professionalSummary: profile.professionalSummary,
      profileImageUrl: profile.profileImageUrl,
      coverImageUrl: profile.coverImageUrl,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      timezone: profile.timezone,
      availabilityStatus: profile.availabilityStatus,
      role: profile.role,
      // Student-specific fields
      ...(profile.student && {
        educationLevel: profile.student.educationLevel,
        ageGroup: profile.student.age_group,
        birthMonth: profile.student.birthMonth,
        birthYear: profile.student.birthYear,
        personalityType: profile.student.personalityType,
        learningStyle: profile.student.learningStyle,
        favoriteQuote: profile.student.favoriteQuote
      })
    }

    return NextResponse.json(formattedProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Separate profile data from student-specific data
    const {
      educationLevel,
      ageGroup,
      birthMonth,
      birthYear,
      personalityType,
      learningStyle,
      favoriteQuote,
      ...profileData
    } = body

    // Update main profile
    const updatedProfile = await updateUserProfile(user.id, profileData)

    // Update student profile if student-specific data is provided
    if (updatedProfile.role === 'student' && 
        (educationLevel || ageGroup || birthMonth || birthYear || personalityType || learningStyle || favoriteQuote)) {
      await updateStudentProfile(user.id, {
        educationLevel,
        ageGroup,
        birthMonth,
        birthYear,
        personalityType,
        learningStyle,
        favoriteQuote
      })
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
