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

    // Get user's profile to determine age group
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let ageGroup = 'young_adult' // default

    // If user is a student, get their age group from student profile
    if (profile.role === 'student') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: user.id },
        select: { age_group: true }
      })

      if (studentProfile?.age_group) {
        ageGroup = studentProfile.age_group
        console.log('✅ Found student age group:', ageGroup)
      } else {
        console.log('⚠️ Student profile found but no age_group set, using default:', ageGroup)
      }
    } else {
      console.log('ℹ️ User is not a student, using default age group:', ageGroup)
    }

    // Allow override via query parameter for testing
    const { searchParams } = new URL(request.url)
    const ageGroupOverride = searchParams.get('ageGroup')
    if (ageGroupOverride) {
      ageGroup = ageGroupOverride
    }

    // Fetch interest categories and interests for the specified age group
    console.log('🔍 Fetching interest categories for age group:', ageGroup)
    const interestCategories = await prisma.interestCategory.findMany({
      where: { ageGroup: ageGroup as any },
      include: { 
        interests: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('✅ Found', interestCategories.length, 'interest categories for age group:', ageGroup)

    const formattedCategories = interestCategories.map(category => ({
      name: category.name,
      interests: category.interests.map(interest => ({
        id: interest.id,
        name: interest.name
      }))
    }))

    console.log('✅ Formatted categories with interests:', formattedCategories.map(cat => `${cat.name}: ${cat.interests.length} interests`))
    console.log('🔍 Sample interest IDs from category data:', formattedCategories[0]?.interests.slice(0, 3).map(i => ({ id: i.id, name: i.name })))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}