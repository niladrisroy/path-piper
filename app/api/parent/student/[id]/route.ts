
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

    // Get student and verify it belongs to this parent
    const student = await prisma.profile.findFirst({
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
        profileImageUrl: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not authorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      student
    })

  } catch (error) {
    console.error('Get parent student error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
