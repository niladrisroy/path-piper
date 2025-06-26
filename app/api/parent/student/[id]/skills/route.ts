
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params

    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user is a parent
    if (user.user_metadata?.role !== 'parent') {
      return NextResponse.json(
        { success: false, error: 'Not authorized as parent' },
        { status: 403 }
      )
    }

    // Find parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { authId: user.id }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    // Verify the student belongs to this parent
    const studentProfile = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Get student's skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: studentId },
      include: {
        skills: {
          include: {
            skill_categories: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const skills = userSkills.map(us => ({
      name: us.skills.name,
      level: us.proficiency_level,
      id: us.skill_id,
      category: us.skills.skill_categories?.name || "Other"
    }))

    return NextResponse.json({
      success: true,
      skills
    })

  } catch (error) {
    console.error('Get parent student skills error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params
    const { skills } = await request.json()

    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user is a parent
    if (user.user_metadata?.role !== 'parent') {
      return NextResponse.json(
        { success: false, error: 'Not authorized as parent' },
        { status: 403 }
      )
    }

    // Find parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { authId: user.id }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    // Verify the student belongs to this parent
    const studentProfile = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Delete existing skills
    await prisma.userSkill.deleteMany({
      where: { userId: studentId }
    })

    // Add new skills
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        let skillRecord

        if (skill.id && skill.id > 0) {
          // Existing skill from database
          skillRecord = await prisma.skill.findUnique({
            where: { id: skill.id }
          })
        } else {
          // Custom skill - find or create
          skillRecord = await prisma.skill.findFirst({
            where: { name: skill.name }
          })

          if (!skillRecord) {
            // Create custom skill
            skillRecord = await prisma.skill.create({
              data: {
                name: skill.name,
                category_id: null // Custom skills don't have a category
              }
            })
          }
        }

        if (skillRecord) {
          await prisma.userSkill.create({
            data: {
              userId: studentId,
              skill_id: skillRecord.id,
              proficiency_level: skill.level
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Skills updated successfully'
    })

  } catch (error) {
    console.error('Update parent student skills error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
