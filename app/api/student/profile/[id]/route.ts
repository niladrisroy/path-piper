
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

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
            }
          }
        },
        studentEducationHistory: {
          include: {
            institution: {
              include: {
                profile: true
              }
            },
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

    // Format the response
    const formattedProfile = {
      id: studentProfile.id,
      ageGroup: studentProfile.age_group,
      educationLevel: studentProfile.educationLevel,
      birthMonth: studentProfile.birthMonth,
      birthYear: studentProfile.birthYear,
      profile: {
        firstName: studentProfile.profile.firstName,
        lastName: studentProfile.profile.lastName,
        bio: studentProfile.profile.bio,
        location: studentProfile.profile.location,
        profileImageUrl: studentProfile.profile.profileImageUrl,
        role: studentProfile.profile.role
      },
      interests: studentProfile.profile.userInterests.map(ui => ({
        id: ui.interest.id,
        name: ui.interest.name,
        category: ui.interest.category.name
      })),
      skills: studentProfile.profile.userSkills.map(us => ({
        id: us.skill.id,
        name: us.skill.name,
        proficiencyLevel: us.proficiencyLevel,
        category: us.skill.category.name
      })),
      educationHistory: studentProfile.studentEducationHistory.map(eh => ({
        id: eh.id,
        institutionName: eh.institutionName,
        institutionType: eh.institutionType ? {
          name: eh.institutionType.name,
          category: eh.institutionType.category.name
        } : null,
        degreeProgram: eh.degreeProgram,
        fieldOfStudy: eh.fieldOfStudy,
        startDate: eh.startDate,
        endDate: eh.endDate,
        isCurrent: eh.isCurrent,
        gradeLevel: eh.gradeLevel,
        gpa: eh.gpa,
        achievements: eh.achievements,
        description: eh.description
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
