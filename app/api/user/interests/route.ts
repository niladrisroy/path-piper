import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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
    const { interests } = await request.json()

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 })
    }

    // Get user's current age group
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    let ageGroup = 'young_adult' // default
    if (profile?.role === 'student') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: user.id },
        select: { age_group: true }
      })
      if (studentProfile?.age_group) {
        ageGroup = studentProfile.age_group
      }
    }

    // Get available interests for user's age group
    const availableInterestCategories = await prisma.interestCategory.findMany({
      where: { ageGroup: ageGroup as any },
      include: { interests: { select: { name: true } } }
    })

    const availableInterestNames = availableInterestCategories.flatMap(
      category => category.interests.map(interest => interest.name)
    )

    // Filter interests to only include those available for current age group
    const validInterests = interests.filter(interest => availableInterestNames.includes(interest))
    console.log('🔍 Filtering interests for age group', ageGroup, '. Valid:', validInterests.length, 'out of', interests.length)

    // Delete existing user interests
    await prisma.userInterest.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Find interest IDs based on valid interest names
    const interestRecords = await prisma.interest.findMany({
      where: {
        name: {
          in: validInterests,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Create new user interests
    const userInterestData = interestRecords.map(interest => ({
      userId: user.id,
      interestId: interest.id,
    }))

    // Handle custom interests that don't exist in database
    const existingInterestNames = interestRecords.map(record => record.name)
    const customInterests = validInterests.filter(interest => !existingInterestNames.includes(interest))

    // For now, we'll skip custom interests that don't exist in the database
    // In a production system, you might want to handle these differently
    if (customInterests.length > 0) {
      console.log('Custom interests not saved (not in database):', customInterests)
    }

    // Also log filtered out interests (those not valid for current age group)
    const filteredOutInterests = interests.filter(interest => !validInterests.includes(interest))
    if (filteredOutInterests.length > 0) {
      console.log('Interests filtered out (not valid for age group', ageGroup, '):', filteredOutInterests)
    }

    if (userInterestData.length > 0) {
      await prisma.userInterest.createMany({
        data: userInterestData,
      })
    }

    return NextResponse.json({ message: 'Interests saved successfully' })
  } catch (error) {
    console.error('Error saving user interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Fetch user's interests
    const userInterests = await prisma.userInterest.findMany({
      where: {
        userId: user.id,
      },
      include: {
        interest: {
          select: {
            name: true,
          },
        },
      },
    })

    const interests = userInterests.map(ui => ui.interest.name)

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}