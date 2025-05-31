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

    // Get available interest IDs for user's current age group (more precise filtering)
    const availableInterests = await prisma.interest.findMany({
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

    const availableInterestIds = availableInterests.map(interest => interest.id)
    const availableInterestNamesMap = new Map(availableInterests.map(interest => [interest.name, interest.id]))

    // Filter interests to only include those available for current age group
    const validInterests = interests.filter(interest => availableInterestNamesMap.has(interest))
    console.log('🔍 Filtering interests for age group', ageGroup, '. Valid:', validInterests.length, 'out of', interests.length)

    // Get currently saved user interests
    const currentUserInterests = await prisma.userInterest.findMany({
      where: { userId: user.id },
      include: { interest: { select: { name: true, id: true } } }
    })

    const currentInterestNames = currentUserInterests.map(ui => ui.interest.name)
    const currentInterestIds = currentUserInterests.map(ui => ui.interest.id)
    
    console.log('🔍 Current saved interests:', currentInterestNames.length, currentInterestNames)
    console.log('🔍 New interests to save:', validInterests.length, validInterests)

    // Find interests to add (in new list but not in current)
    const interestsToAdd = validInterests.filter(interest => !currentInterestNames.includes(interest))
    
    // Find interests to remove (in current but not in new list, or not valid for current age group)
    const interestsToRemove = currentUserInterests.filter(ui => 
      !validInterests.includes(ui.interest.name) || !availableInterestIds.includes(ui.interest.id)
    )

    console.log('➕ Interests to add:', interestsToAdd.length, interestsToAdd)
    console.log('➖ Interests to remove:', interestsToRemove.length, interestsToRemove.map(ui => ui.interest.name))

    // Remove interests that are no longer selected or not valid for current age group
    if (interestsToRemove.length > 0) {
      const removedCount = await prisma.userInterest.deleteMany({
        where: {
          userId: user.id,
          interestId: {
            in: interestsToRemove.map(ui => ui.interest.id)
          }
        },
      })
      console.log('🗑️ Removed', removedCount.count, 'interests')
    }

    // Add new interests
    if (interestsToAdd.length > 0) {
      const userInterestData = interestsToAdd
        .map(interestName => {
          const interestId = availableInterestNamesMap.get(interestName)
          return interestId ? {
            userId: user.id,
            interestId: interestId,
          } : null
        })
        .filter(Boolean) as { userId: string; interestId: number }[]

      if (userInterestData.length > 0) {
        const created = await prisma.userInterest.createMany({
          data: userInterestData,
        })
        console.log('✅ Added', created.count, 'new interests')
      }
    }

    // Handle custom interests that don't exist in database
    const customInterests = validInterests.filter(interest => !availableInterestNamesMap.has(interest))
    if (customInterests.length > 0) {
      console.log('⚠️ Custom interests not saved (not in database for age group', ageGroup, '):', customInterests)
    }

    // Log filtered out interests (those not valid for current age group)
    const filteredOutInterests = interests.filter(interest => !validInterests.includes(interest))
    if (filteredOutInterests.length > 0) {
      console.log('❌ Interests filtered out (not valid for age group', ageGroup, '):', filteredOutInterests)
    }

    const unchangedCount = currentInterestNames.filter(name => validInterests.includes(name)).length
    console.log('🔄 Unchanged interests:', unchangedCount)

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

    // Get user's age group to filter interests
    let ageGroup = 'young_adult' // default

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (profile?.role === 'student') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: user.id },
        select: { age_group: true }
      })
      if (studentProfile?.age_group) {
        ageGroup = studentProfile.age_group
      }
    }

    // Get available interests for user's current age group
    const availableInterestCategories = await prisma.interestCategory.findMany({
      where: { ageGroup: ageGroup as any },
      include: { interests: { select: { name: true } } }
    })

    const availableInterestNames = availableInterestCategories.flatMap(
      category => category.interests.map(interest => interest.name)
    )

    // Get user's interests with both ID and name
    const userInterests = await prisma.userInterest.findMany({
      where: {
        userId: user.id,
      },
      include: {
        interest: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          },
        },
      },
    })

    // Get all available interests for user's current age group with their IDs
    const availableInterests = await prisma.interest.findMany({
      where: {
        category: {
          ageGroup: ageGroup as any
        }
      },
      select: {
        id: true,
        name: true,
        categoryId: true
      }
    })

    const availableInterestIds = availableInterests.map(interest => interest.id)

    console.log('🔍 Available interest IDs for age group', ageGroup, ':', availableInterestIds.length)
    console.log('🔍 User interest IDs:', userInterests.map(ui => ui.interest.id))

    // Since we now only store age-appropriate interests, all user interests should be valid
    // But let's still filter as a safety measure
    const validUserInterests = userInterests.filter(ui => 
      availableInterestIds.includes(ui.interest.id)
    )

    const interests = validUserInterests.map(ui => ({
      id: ui.interest.id,
      name: ui.interest.name,
      categoryId: ui.interest.categoryId
    }))

    console.log('✅ User interests for age group', ageGroup, '. Total stored:', userInterests.length, 'Valid for current age:', interests.length, 'Available for age group:', availableInterestIds.length)

    // If there are stored interests that are not valid for current age group, 
    // it means the user's age group changed and we should clean them up
    if (userInterests.length > interests.length) {
      const invalidInterestIds = userInterests
        .filter(ui => !availableInterestIds.includes(ui.interest.id))
        .map(ui => ui.interest.id)
      
      console.log('🧹 Found interests from other age groups, cleaning up:', invalidInterestIds)
      
      await prisma.userInterest.deleteMany({
        where: {
          userId: user.id,
          interestId: {
            in: invalidInterestIds
          }
        }
      })
      
      console.log('✅ Cleaned up', invalidInterestIds.length, 'interests from previous age groups')
    }

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}