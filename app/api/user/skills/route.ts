
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')

    if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`, {
      headers: {
        cookie: `sb-access-token=${accessTokenCookie.value}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { user } = await userResponse.json()

    console.log('🔍 Fetching skills for user:', user.id)

    // Get user's current skills with skill details using Prisma
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: {
          include: {
            category: {
              select: {
                name: true,
                ageGroup: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Found', userSkills.length, 'skills for user')

    // Transform to match the expected format
    const transformedSkills = userSkills.map(userSkill => ({
      skill_id: userSkill.skillId,
      proficiency_level: userSkill.proficiencyLevel,
      skills: {
        id: userSkill.skill.id,
        name: userSkill.skill.name,
        skill_categories: {
          name: userSkill.skill.category.name,
          age_group: userSkill.skill.category.ageGroup
        }
      }
    }))

    return NextResponse.json({ skills: transformedSkills })
  } catch (error) {
    console.error('Error in GET /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')

    if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`, {
      headers: {
        cookie: `sb-access-token=${accessTokenCookie.value}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { user } = await userResponse.json()
    const { skills } = await request.json()

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 })
    }

    console.log('💾 Saving skills for user:', user.id, 'Skills count:', skills.length)

    // First, delete existing user skills to replace them
    await prisma.userSkill.deleteMany({
      where: { userId: user.id }
    })

    // Insert new skills if any are provided
    if (skills.length > 0) {
      const skillsData = skills.map(skill => ({
        userId: user.id,
        skillId: skill.id,
        proficiencyLevel: skill.level
      }))

      await prisma.userSkill.createMany({
        data: skillsData
      })

      console.log('✅ Successfully saved', skillsData.length, 'skills')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
