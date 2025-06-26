
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if parent profile exists
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!parentProfile) {
      return NextResponse.json({
        success: false,
        error: 'You are currently not registered as a parent. Please contact support or wait for your child to register with your email.'
      }, { status: 404 })
    }

    // Check if parent already has an auth account
    const hasAccount = !!parentProfile.authId

    return NextResponse.json({
      success: true,
      hasAccount,
      parentId: parentProfile.id.toString()
    })

  } catch (error) {
    console.error('Parent email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
