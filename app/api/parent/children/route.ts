
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const parentId = cookieStore.get('parent_id')?.value
    const parentSession = cookieStore.get('parent_session')?.value

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get parent profile
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { id: parseInt(parentId) }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent not found' },
        { status: 404 }
      )
    }

    // Find all children linked to this parent
    const children = await prisma.profile.findMany({
      where: {
        parentId: parseInt(parentId),
        role: 'student'
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Convert BigInt IDs to strings for JSON serialization
    const serializedChildren = children.map(child => ({
      ...child,
      id: child.id.toString(),
      parentId: child.parentId?.toString()
    }))

    return NextResponse.json({
      success: true,
      children: serializedChildren,
      parentName: parentProfile.name
    })

  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}
