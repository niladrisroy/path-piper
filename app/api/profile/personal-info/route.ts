import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, updateStudentProfile } from '@/lib/db/profile'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null

    if (parentViewMode && parentViewStudentId) {
      // Parent is viewing a student's profile
      userId = parentViewStudentId
    } else {
      // Normal authentication flow
      const accessToken = request.cookies.get('sb-access-token')?.value

      if (!accessToken) {
        return NextResponse.json(
          { error: 'No access token found' }, 
          { status: 401 }
        )
      }

      // Verify token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication' }, 
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Use optimized single query to get all profile data
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
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
        level: us.proficiencyLevel
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
    const body = await request.json()

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let userId = null
    let isParentUpdate = false

    if (parentViewMode && parentViewStudentId) {
      // Parent is updating a student's profile
      userId = parentViewStudentId
      isParentUpdate = true

      // Verify parent has permission (get parent auth from cookie)
      const parentAuthId = request.cookies.get('parent-auth-id')?.value
      if (!parentAuthId) {
        return NextResponse.json(
          { error: 'Parent authentication required' }, 
          { status: 401 }
        )
      }

      // Verify parent profile and student relationship
      const parentProfile = await prisma.parentProfile.findFirst({
        where: { authId: parentAuthId }
      })

      if (!parentProfile) {
        return NextResponse.json(
          { error: 'Parent profile not found' }, 
          { status: 404 }
        )
      }

      // Verify student belongs to this parent
      const studentProfile = await prisma.profile.findFirst({
        where: {
          id: parentViewStudentId,
          parentId: parentProfile.id,
          role: 'student'
        }
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: 'Student not found or not authorized' }, 
          { status: 404 }
        )
      }
    } else {
      // Normal authentication flow
      const accessToken = request.cookies.get('sb-access-token')?.value

      if (!accessToken) {
        return NextResponse.json(
          { error: 'No access token found' }, 
          { status: 401 }
        )
      }

      // Verify token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication' }, 
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio,
        location: body.location,
        tagline: body.tagline,
        professionalSummary: body.professionalSummary,
        email: body.email,
        phone: body.phone,
        timezone: body.timezone,
        availabilityStatus: body.availabilityStatus
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        tagline: true,
        professionalSummary: true,
        email: true,
        phone: true,
        timezone: true,
        availabilityStatus: true,
        profileImageUrl: true,
        coverImageUrl: true
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error updating personal info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}