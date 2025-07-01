
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // OPTIMIZED: Single query to get current user profile and check role
    const currentUserProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!currentUserProfile || currentUserProfile.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can view student profiles' },
        { status: 403 }
      )
    }

    // OPTIMIZED: Single comprehensive query with all includes to fetch complete student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        profile: {
          include: {
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
            },
            socialLinks: true,
            careerGoals: {
              orderBy: {
                createdAt: 'desc'
              }
            },
            customBadges: {
              orderBy: {
                earnedDate: 'desc'
              }
            }
          }
        },
        educationHistory: {
          include: {
            institutionType: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Check if target profile is a student (role validation)
    if (studentProfile.profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Profile is not a student profile' },
        { status: 403 }
      )
    }

    // Format the response - for viewing other profiles, we might want to limit some sensitive data
    const isOwnProfile = studentId === user.id

    const formattedProfile = {
      id: studentProfile.id,
      ageGroup: studentProfile.age_group,
      educationLevel: studentProfile.educationLevel,
      // Only show birth info for own profile
      birthMonth: isOwnProfile ? studentProfile.birthMonth : null,
      birthYear: isOwnProfile ? studentProfile.birthYear : null,
      personalityType: studentProfile.personalityType,
      learningStyle: studentProfile.learningStyle,
      favoriteQuote: studentProfile.favoriteQuote,
      profile: {
        firstName: studentProfile.profile.firstName,
        lastName: studentProfile.profile.lastName,
        bio: studentProfile.profile.bio,
        location: studentProfile.profile.location,
        profileImageUrl: studentProfile.profile.profileImageUrl,
        coverImageUrl: studentProfile.profile.coverImageUrl,
        verificationStatus: studentProfile.profile.verificationStatus,
        role: studentProfile.profile.role,
        userInterests: studentProfile.profile.userInterests,
        userSkills: studentProfile.profile.userSkills.map(userSkill => ({
          ...userSkill,
          skill: {
            ...userSkill.skill,
            categoryId: userSkill.skill.categoryId,
            categoryName: userSkill.skill.category?.name || 'Uncategorized'
          }
        })),
        // Only show sensitive contact info for own profile
        socialLinks: isOwnProfile ? studentProfile.profile.socialLinks : [],
        careerGoals: studentProfile.profile.careerGoals,
        customBadges: studentProfile.profile.customBadges
      },
      educationHistory: studentProfile.educationHistory.map(edu => ({
        id: edu.id,
        institutionName: edu.institutionName,
        institutionTypeId: edu.institutionTypeId,
        institutionTypeName: edu.institutionType?.name,
        institutionCategoryName: edu.institutionType?.category?.name,
        degreeProgram: edu.degreeProgram,
        fieldOfStudy: edu.fieldOfStudy,
        subjects: edu.subjects,
        startDate: edu.startDate,
        endDate: edu.endDate,
        isCurrent: edu.isCurrent,
        gradeLevel: edu.gradeLevel,
        gpa: edu.gpa,
        achievements: edu.achievements,
        description: edu.description
      }))
    }

    return NextResponse.json(formattedProfile)

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
