
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; circleId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: childId, circleId } = resolvedParams

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parseInt(parentId),
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    // Verify the child is a member of the circle
    const childMembership = await prisma.circleMembership.findFirst({
      where: {
        userId: childId,
        circleId: circleId
      }
    })

    if (!childMembership) {
      return NextResponse.json(
        { success: false, error: 'Child is not a member of this circle' },
        { status: 403 }
      )
    }

    // Get all members of the circle
    const members = await prisma.circleMembership.findMany({
      where: {
        circleId: circleId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      }
    })

    // Transform the data
    const membersList = members.map(membership => ({
      id: membership.user.id,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      profileImageUrl: membership.user.profileImageUrl,
      role: membership.user.role
    }))

    return NextResponse.json({
      success: true,
      members: membersList
    })

  } catch (error) {
    console.error('Error fetching circle members:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
