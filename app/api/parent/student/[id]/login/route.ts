
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
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
      },
      include: {
        student: true
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    // Create a response that sets session cookies for the student
    const response = NextResponse.json({
      success: true,
      studentId: studentProfile.id,
      redirectUrl: `/student/profile/${studentProfile.id}`
    })

    // Set temporary session cookies to indicate parent is viewing as student
    response.cookies.set('parent-view-mode', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/'
    })

    response.cookies.set('parent-view-student-id', studentId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/'
    })

    response.cookies.set('parent-auth-id', user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Parent student login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
