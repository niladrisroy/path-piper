
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

    // Get user's age group to validate skills
    const ageGroup = user.studentProfile?.age_group || 'elementary'
    console.log('🔍 User age group:', ageGroup)

    // Get available skills for user's current age group
    const availableSkills = await prisma.skill.findMany({
      where: {
        category: {
          ageGroup: ageGroup as any
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const availableSkillIds = availableSkills.map(skill => skill.id)
    const availableSkillNamesMap = new Map(availableSkills.map(skill => [skill.name, skill.id]))

    // Filter skills to only include those available for current age group
    const validSkills = skills.filter(skill => 
      skill.id ? availableSkillIds.includes(skill.id) : availableSkillNamesMap.has(skill.name)
    )
    console.log('🔍 Filtering skills for age group', ageGroup, '. Valid:', validSkills.length, 'out of', skills.length)

    // Delete ALL existing user skills (from any age group)
    const deletedCount = await prisma.userSkill.deleteMany({
      where: {
        userId: user.id,
      },
    })
    console.log('🗑️ Deleted', deletedCount.count, 'existing user skills from all age groups')

    // Only create skills that are valid for current age group
    const userSkillData = validSkills
      .map(skill => {
        const skillId = skill.id || availableSkillNamesMap.get(skill.name)
        return skillId ? {
          userId: user.id,
          skillId: skillId,
          proficiencyLevel: skill.level || 1
        } : null
      })
      .filter(Boolean) as { userId: string; skillId: number; proficiencyLevel: number }[]

    // Log custom skills that don't exist in database
    const existingSkills = validSkills.filter(skill => 
      skill.id ? availableSkillIds.includes(skill.id) : availableSkillNamesMap.has(skill.name)
    )
    const customSkills = validSkills.filter(skill => 
      skill.id ? !availableSkillIds.includes(skill.id) : !availableSkillNamesMap.has(skill.name)
    )

    if (customSkills.length > 0) {
      console.log('⚠️ Custom skills not saved (not in database for age group', ageGroup, '):', customSkills.map(s => s.name))
    }

    // Log filtered out skills (those not valid for current age group)
    const filteredOutSkills = skills.filter(skill => !validSkills.includes(skill))
    if (filteredOutSkills.length > 0) {
      console.log('❌ Skills filtered out (not valid for age group', ageGroup, '):', filteredOutSkills.map(s => s.name))
    }

    // Create new user skills
    if (userSkillData.length > 0) {
      await prisma.userSkill.createMany({
        data: userSkillData
      })
      console.log('✅ Created', userSkillData.length, 'new user skills for age group', ageGroup)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
