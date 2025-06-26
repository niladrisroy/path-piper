
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    
    // Clear parent view mode cookies
    response.cookies.delete('parent-view-mode')
    response.cookies.delete('parent-view-student-id')
    response.cookies.delete('parent-auth-id')
    
    return response
  } catch (error) {
    console.error('Parent logout student view error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
