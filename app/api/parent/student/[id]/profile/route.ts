
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Get student profile and verify it belongs to this parent
    const studentProfile = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        profileImageUrl: true,
        tagline: true,
        professionalSummary: true,
        email: true,
        phone: true,
        coverImageUrl: true,
        themePreference: true,
        timezone: true,
        availabilityStatus: true,
        lastActiveDate: true,
        profileViews: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: studentProfile
    })

  } catch (error) {
    console.error('Get parent student profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params
    const body = await request.json()

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

    // Verify student belongs to this parent
    const existingStudent = await prisma.profile.findFirst({
      where: {
        id: studentId,
        parentId: parentProfile.id,
        role: 'student'
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Update the student's profile
    const updatedProfile = await prisma.profile.update({
      where: { id: studentId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio,
        location: body.location,
        tagline: body.tagline,
        professionalSummary: body.professionalSummary,
        email: body.email,
        phone: body.phone,
        timezone: body.timezone,
        availabilityStatus: body.availabilityStatus
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Update parent student profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
