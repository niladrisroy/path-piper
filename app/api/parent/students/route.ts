
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
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

    // Get all students linked to this parent
    const students = await prisma.profile.findMany({
      where: {
        parentId: parentProfile.id,
        role: 'student'
      },
      include: {
        student: {
          select: {
            age_group: true,
            educationLevel: true
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        createdAt: true,
        student: true
      }
    })

    const studentsWithDetails = students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      profileImageUrl: student.profileImageUrl,
      bio: student.bio,
      age_group: student.student?.age_group,
      educationLevel: student.student?.educationLevel,
      createdAt: student.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      students: studentsWithDetails,
      parentEmail: parentProfile.email
    })

  } catch (error) {
    console.error('Get parent students error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
