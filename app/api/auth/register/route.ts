import { NextRequest, NextResponse } from 'next/server'
import { registerStudent } from '@/lib/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, ...userData } = body

    let result

    if (role === "student") {
    result = await registerStudent(userData)
  } else {
    return NextResponse.json(
      { success: false, error: "Invalid role specified" },
      { status: 400 },
    )
  }

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}