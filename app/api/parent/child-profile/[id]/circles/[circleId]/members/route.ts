
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; circleId: string } }
) {
  try {
    const childId = params.id
    const circleId = params.circleId
    
    console.log('🔍 Parent requesting circle members for child:', childId, 'circle:', circleId)

    // Get parent session from cookies
    const cookieStore = request.cookies
    const sessionData = cookieStore.get('parent-session')?.value

    if (!sessionData) {
      console.log('❌ No parent session found')
      return NextResponse.json(
        { success: false, error: 'Parent not authenticated' },
        { status: 401 }
      )
    }

    let parentData
    try {
      parentData = JSON.parse(sessionData)
    } catch (error) {
      console.log('❌ Invalid parent session data')
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    const parentId = parentData.id

    // Verify the child belongs to this parent
    const childProfile = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!childProfile) {
      console.log('❌ Child not found or not associated with this parent')
      return NextResponse.json(
        { success: false, error: 'Child profile not found or access denied' },
        { status: 403 }
      )
    }

    console.log('✅ Parent verified, fetching circle members')

    // Get the circle with all members
    const circle = await prisma.circleBadge.findUnique({
      where: { id: circleId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        },
        memberships: {
          where: {
            status: 'active'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
                bio: true
              }
            }
          }
        }
      }
    })

    if (!circle) {
      return NextResponse.json(
        { success: false, error: 'Circle not found' },
        { status: 404 }
      )
    }

    // Combine creator and members into a single array
    const allMembers = []

    // Add creator first
    if (circle.creator) {
      allMembers.push({
        id: circle.creator.id,
        firstName: circle.creator.firstName,
        lastName: circle.creator.lastName,
        profileImageUrl: circle.creator.profileImageUrl,
        role: 'creator',
        bio: null,
        isCreator: true
      })
    }

    // Add other members
    circle.memberships.forEach(membership => {
      allMembers.push({
        id: membership.user.id,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        profileImageUrl: membership.user.profileImageUrl,
        role: membership.user.role,
        bio: membership.user.bio,
        isCreator: false
      })
    })

    console.log('✅ Returning', allMembers.length, 'members for circle:', circle.name)

    return NextResponse.json({
      success: true,
      circle: {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        color: circle.color,
        icon: circle.icon
      },
      members: allMembers
    })

  } catch (error) {
    console.error('❌ Error fetching circle members:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
