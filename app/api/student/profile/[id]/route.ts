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

    // Check if parent is viewing as student
    const parentViewMode = request.cookies.get('parent-view-mode')?.value === 'true'
    const parentViewStudentId = request.cookies.get('parent-view-student-id')?.value
    let user = null
    let isParentView = false

    if (parentViewMode && parentViewStudentId && parentViewStudentId === studentId) {
      // Parent is viewing this student's profile, allow access
      console.log('API: Parent view mode access granted for student:', studentId)
      isParentView = true
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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Invalid authentication' }, 
          { status: 401 }
        )
      }

      user = authUser

      // Check if user has permission to view this profile
      if (user.id !== studentId) {
        return NextResponse.json(
          { error: 'Access denied' }, 
          { status: 403 }
        )
      }
    }

    // Fetch student profile with all related data
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

    // Format the response - for viewing other profiles, we might want to limit some sensitive data
    // In parent view mode, treat as own profile for data access purposes
    const isOwnProfile = isParentView || (user && studentId === user.id)

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