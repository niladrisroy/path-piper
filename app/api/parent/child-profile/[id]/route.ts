
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // OPTIMIZED: Single query to verify parent-child relationship and get parent info
    const [child, parentProfile] = await Promise.all([
      prisma.profile.findFirst({
        where: {
          id: childId,
          parentId: parseInt(parentId),
          role: 'student'
        },
        select: { id: true }
      }),
      prisma.parentProfile.findUnique({
        where: { id: parseInt(parentId) },
        select: { name: true }
      })
    ])

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    // OPTIMIZED: Single comprehensive query to fetch complete child profile data
    const childProfile = await prisma.studentProfile.findUnique({
      where: { id: childId },
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
            goals: {
              orderBy: {
                createdAt: 'desc'
              }
            },
            achievements: {
              include: {
                achievementType: {
                  include: {
                    category: true
                  }
                }
              },
              orderBy: {
                dateOfAchievement: 'desc'
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

    if (!childProfile) {
      return NextResponse.json(
        { success: false, error: 'Child profile not found' },
        { status: 404 }
      )
    }

    // OPTIMIZED: Single query to get connections instead of separate relationship check
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: childId },
          { user2Id: childId }
        ]
      }
    })

    // Format the complete response
    const formattedProfile = {
      id: childProfile.id,
      ageGroup: childProfile.age_group,
      educationLevel: childProfile.educationLevel,
      birthMonth: childProfile.birthMonth,
      birthYear: childProfile.birthYear,
      personalityType: childProfile.personalityType,
      learningStyle: childProfile.learningStyle,
      favoriteQuote: childProfile.favoriteQuote,
      profile: {
        firstName: childProfile.profile.firstName,
        lastName: childProfile.profile.lastName,
        bio: childProfile.profile.bio,
        location: childProfile.profile.location,
        profileImageUrl: childProfile.profile.profileImageUrl,
        coverImageUrl: childProfile.profile.coverImageUrl,
        verificationStatus: childProfile.profile.verificationStatus,
        role: childProfile.profile.role,
        userInterests: childProfile.profile.userInterests.map(ui => ({
          ...ui,
          interest: {
            ...ui.interest,
            category: ui.interest.category
          }
        })),
        userSkills: childProfile.profile.userSkills.map(us => ({
          ...us,
          skill: {
            ...us.skill,
            category: us.skill.category
          }
        })),
        socialLinks: childProfile.profile.socialLinks,
        goals: childProfile.profile.goals,
        achievements: childProfile.profile.achievements.map(achievement => ({
          ...achievement,
          achievementType: achievement.achievementType ? {
            ...achievement.achievementType,
            category: achievement.achievementType.category
          } : null
        }))
      },
      educationHistory: childProfile.educationHistory.map(edu => ({
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
      })),
      connections: connections.length,
      parentInfo: {
        name: parentProfile.name
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedProfile
    })

  } catch (error) {
    console.error('Error fetching child profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
