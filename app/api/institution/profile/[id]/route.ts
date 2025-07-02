
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    // Fetch institution profile with related profile data
    const institutionProfile = await prisma.institutionProfile.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            bio: true,
            location: true,
            profileImageUrl: true,
            email: true,
            phone: true,
          }
        }
      }
    })

    if (!institutionProfile) {
      return NextResponse.json(
        { error: 'Institution profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(institutionProfile)
  } catch (error) {
    console.error('Error fetching institution profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}
