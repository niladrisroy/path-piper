
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const content = searchParams.get('content') || 'Test content for moderation'
    
    // Test the moderation endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/moderation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type: 'post',
        userId: 'test-user-id'
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      testContent: content,
      moderationResult: result.moderation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test moderation API error:', error)
    return NextResponse.json({ 
      error: 'Failed to test moderation',
      details: (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testCases } = body
    
    const results = []
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    for (const testCase of testCases) {
      try {
        const response = await fetch(`${baseUrl}/api/moderation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: testCase,
            type: 'post',
            userId: 'batch-test-user-id'
          })
        })

        const result = await response.json()
        results.push({
          content: testCase,
          result: result.moderation,
          success: true
        })
      } catch (error) {
        results.push({
          content: testCase,
          error: (error as Error).message,
          success: false
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      totalTests: testCases.length,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Batch test moderation API error:', error)
    return NextResponse.json({ 
      error: 'Failed to run batch tests',
      details: (error as Error).message 
    }, { status: 500 })
  }
}
