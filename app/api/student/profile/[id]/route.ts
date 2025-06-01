
import { NextRequest, NextResponse } from 'next/server'
import { getStudentProfile } from '@/lib/db/student'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const student = await getStudentProfile(studentId)

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      student
    })
  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
