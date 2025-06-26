
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params

    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user is a parent
    if (user.user_metadata?.role !== 'parent') {
      return NextResponse.json(
        { success: false, error: 'Not authorized as parent' },
        { status: 403 }
      )
    }

    // Find parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { authId: user.id }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    // Verify the student belongs to this parent
    const studentProfile = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Get student's interests
    const userInterests = await prisma.userInterest.findMany({
      where: { userId: studentId },
      include: {
        interest: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    const interests = userInterests.map(ui => ({
      id: ui.interest.id,
      name: ui.interest.name,
      category: ui.interest.category
    }))

    return NextResponse.json({
      success: true,
      interests
    })

  } catch (error) {
    console.error('Get parent student interests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params
    const { interests } = await request.json()

    // Get auth token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user is a parent
    if (user.user_metadata?.role !== 'parent') {
      return NextResponse.json(
        { success: false, error: 'Not authorized as parent' },
        { status: 403 }
      )
    }

    // Find parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { authId: user.id }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    // Verify the student belongs to this parent
    const studentProfile = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Delete existing interests
    await prisma.userInterest.deleteMany({
      where: { userId: studentId }
    })

    // Add new interests
    if (interests && interests.length > 0) {
      for (const interestName of interests) {
        // Find or create interest
        let interest = await prisma.interest.findFirst({
          where: { name: interestName }
        })

        if (!interest) {
          interest = await prisma.interest.create({
            data: {
              name: interestName,
              category: 'Custom'
            }
          })
        }

        // Create user interest
        await prisma.userInterest.create({
          data: {
            userId: studentId,
            interestId: interest.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Interests updated successfully'
    })

  } catch (error) {
    console.error('Update parent student interests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
