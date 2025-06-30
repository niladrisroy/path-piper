import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(
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

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parseInt(parentId),
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    const { section, data } = await request.json()

    // Using service role key to bypass RLS and allow parent edits
    switch (section) {
      case 'about':
        await prisma.profile.update({
          where: { id: childId },
          data: {
            bio: data.bio,
            location: data.location,
            tagline: data.tagline
          }
        })
        break

      case 'interests':
        // Delete existing interests
        await prisma.userInterest.deleteMany({
          where: { userId: childId }
        })

        // Add new interests
        if (data.interests && data.interests.length > 0) {
          await prisma.userInterest.createMany({
            data: data.interests.map((interestId: string) => ({
              userId: childId,
              interestId: interestId
            }))
          })
        }
        break

      case 'skills':
        // Delete existing skills
        await prisma.userSkill.deleteMany({
          where: { userId: childId }
        })

        // Add new skills
        if (data.skills && data.skills.length > 0) {
          await prisma.userSkill.createMany({
            data: data.skills.map((skill: any) => ({
              userId: childId,
              skillId: skill.skillId,
              proficiencyLevel: skill.proficiencyLevel
            }))
          })
        }
        break

      case 'education':
        if (data.educationId) {
          // Update existing education
          await prisma.studentEducationHistory.update({
            where: { id: data.educationId },
            data: {
              institutionName: data.institutionName,
              institutionTypeId: data.institutionTypeId,
              degreeProgram: data.degreeProgram,
              fieldOfStudy: data.fieldOfStudy,
              subjects: data.subjects,
              startDate: data.startDate,
              endDate: data.endDate,
              isCurrent: data.isCurrent,
              gradeLevel: data.gradeLevel,
              gpa: data.gpa,
              description: data.description
            }
          })
        } else {
          // Create new education entry
          await prisma.studentEducationHistory.create({
            data: {
              studentId: childId,
              institutionName: data.institutionName,
              institutionTypeId: data.institutionTypeId,
              degreeProgram: data.degreeProgram,
              fieldOfStudy: data.fieldOfStudy,
              subjects: data.subjects,
              startDate: data.startDate,
              endDate: data.endDate,
              isCurrent: data.isCurrent,
              gradeLevel: data.gradeLevel,
              gpa: data.gpa,
              description: data.description
            }
          })
        }
        break

      case 'goals':
        if (data.goalId) {
          // Update existing goal
          await prisma.careerGoal.update({
            where: { id: data.goalId },
            data: {
              title: data.title,
              description: data.description,
              targetDate: data.targetDate
            }
          })
        } else {
          // Create new goal
          await prisma.careerGoal.create({
            data: {
              userId: childId,
              title: data.title,
              description: data.description,
              targetDate: data.targetDate
            }
          })
        }
        break

      case 'achievements':
          // Create a new achievement using the userAchievement table
          await prisma.userAchievement.create({
            data: {
              userId: childId,
              name: data.name, // Using 'name' field as per schema
              description: data.description,
              dateOfAchievement: data.dateOfAchievement ? new Date(data.dateOfAchievement) : new Date(),
              achievementImageIcon: data.achievementImageIcon || null,
              achievementTypeId: data.achievementTypeId ? parseInt(data.achievementTypeId) : null
            }
          })
        break

      case 'social-links':
        // Delete existing social links
        await prisma.socialLink.deleteMany({
          where: { userId: childId }
        })

        // Add new social links
        if (data.socialLinks && data.socialLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: data.socialLinks.map((link: any) => ({
              userId: childId,
              platform: link.platform,
              url: link.url
            }))
          })
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid section' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating child profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parseInt(parentId),
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    const { section, itemId } = await request.json()

    // Using service role key to bypass RLS and allow parent deletions
    switch (section) {
      case 'education':
        await prisma.studentEducationHistory.delete({
          where: { id: itemId }
        })
        break

      case 'goals':
        await prisma.careerGoal.delete({
          where: { id: itemId }
        })
        break

      case 'achievements':
        await prisma.customBadge.delete({
          where: { id: itemId }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid section for deletion' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}