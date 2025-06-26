
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

    // Get student's education history
    const educationHistory = await prisma.studentEducationHistory.findMany({
      where: { studentId: studentId },
      orderBy: { startDate: 'desc' },
      include: {
        institutionType: {
          select: {
            name: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedEducation = educationHistory.map(entry => ({
      id: entry.id,
      institutionName: entry.institutionName,
      institutionCategory: "", // Would need to be derived from institutionType
      institutionType: entry.institutionTypeId?.toString() || "",
      institutionTypeName: entry.institutionType?.name || "",
      degree: entry.degreeProgram || "",
      fieldOfStudy: entry.fieldOfStudy || "",
      subjects: entry.subjects || [],
      startDate: entry.startDate ? entry.startDate.toISOString() : "",
      endDate: entry.endDate ? entry.endDate.toISOString() : "",
      isCurrent: entry.isCurrent || false,
      grade: entry.gradeLevel || "",
      description: entry.description || ""
    }))

    return NextResponse.json({
      success: true,
      education: transformedEducation
    })

  } catch (error) {
    console.error('Get parent student education error:', error)
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
    const { education } = await request.json()

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

    // Delete existing education history
    await prisma.studentEducationHistory.deleteMany({
      where: { studentId: studentId }
    })

    // Insert new education history
    if (education && education.length > 0) {
      const educationData = education.map((entry: any) => ({
        studentId: studentId,
        institutionName: entry.institutionName,
        institutionTypeId: entry.institutionType ? parseInt(entry.institutionType) : null,
        degreeProgram: entry.degree || null,
        fieldOfStudy: entry.fieldOfStudy || null,
        subjects: entry.subjects || [],
        startDate: entry.startDate ? new Date(entry.startDate) : null,
        endDate: entry.endDate ? new Date(entry.endDate) : null,
        isCurrent: entry.isCurrent || false,
        gradeLevel: entry.grade || null,
        description: entry.description || null
      }))

      await prisma.studentEducationHistory.createMany({
        data: educationData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Education history updated successfully'
    })

  } catch (error) {
    console.error('Update parent student education error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
