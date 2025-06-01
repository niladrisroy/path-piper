
import { NextRequest, NextResponse } from 'next/server'
import { getStudentProfile } from '@/lib/db/student'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const studentProfile = await getStudentProfile(studentId)

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      educationHistory: studentProfile.educationHistory || []
    })
  } catch (error) {
    console.error('Error fetching student education:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch education data' },
      { status: 500 }
    )
  }
}
