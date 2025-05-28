
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('auth-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`, {
      headers: {
        cookie: `auth-session=${sessionCookie.value}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { user } = await userResponse.json()

    // Get user's profile to determine age group
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { userRole: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let ageGroup = 'young_adult' // default

    // If user is a student, get their age group from student profile
    if (profile.userRole === 'student') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        select: { ageGroup: true }
      })
      
      if (studentProfile?.ageGroup) {
        ageGroup = studentProfile.ageGroup
      }
    }

    // Allow override via query parameter for testing
    const { searchParams } = new URL(request.url)
    const ageGroupOverride = searchParams.get('ageGroup')
    if (ageGroupOverride) {
      ageGroup = ageGroupOverride
    }

    // Fetch interest categories and interests for the specified age group
    const interestCategories = await prisma.interestCategory.findMany({
      where: {
        ageGroup: ageGroup as any,
      },
      include: {
        interests: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Transform data to match the expected format
    const formattedCategories = interestCategories.map(category => ({
      name: category.name,
      interests: category.interests.map(interest => interest.name),
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
