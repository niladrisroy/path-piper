
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

    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group is required' }, { status: 400 })
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
