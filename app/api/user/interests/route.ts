
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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
    const { interests } = await request.json()

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 })
    }

    // Delete existing user interests
    await prisma.userInterest.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Find interest IDs based on names
    const interestRecords = await prisma.interest.findMany({
      where: {
        name: {
          in: interests,
        },
      },
    })

    // Create new user interests
    const userInterestData = interestRecords.map(interest => ({
      userId: user.id,
      interestId: interest.id,
    }))

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
