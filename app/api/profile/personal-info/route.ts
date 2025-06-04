
import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, updateStudentProfile } from '@/lib/db/profile'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Get the access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    // Use optimized single query to get all profile data
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        mentor: true,
        institution: true,
        userInterests: {
          include: {
            interest: {
              include: {
                category: true
              }
            }
          }
        },
        userSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
    
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
      }),
      // Include interests and skills
      interests: profile.userInterests?.map(ui => ({
        id: ui.interest.id,
        name: ui.interest.name,
        category: ui.interest.category.name
      })) || [],
      skills: profile.userSkills?.map(us => ({
        id: us.skill.id,
        name: us.skill.name,
        category: us.skill.category.name,
        level: us.level
      })) || []
    }

    const response = NextResponse.json(formattedProfile)
    
    // Add cache headers to reduce unnecessary requests
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')
    
    return response
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
    const cookieStore = await cookies()
    
    // Get the access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
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

    // Update main profile using Prisma
    const updatedProfile = await updateUserProfile(user.id, profileData)

    // Update student profile if student-specific data is provided
    if (updatedProfile.role === 'student' && 
        (educationLevel || ageGroup || birthMonth || birthYear || personalityType || learningStyle || favoriteQuote)) {
      await updateStudentProfile(user.id, {
        educationLevel,
        age_group: ageGroup, // Note: using age_group as per database schema
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
