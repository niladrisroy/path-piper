
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', request.url))
    }

    // Decode token to get email and timestamp
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', request.url))
    }

    const [email, timestamp] = decodedToken.split(':')

    if (!email || !timestamp) {
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', request.url))
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = parseInt(timestamp)
    const currentTime = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (currentTime - tokenTimestamp > twentyFourHours) {
      return NextResponse.redirect(new URL('/parent/login?error=token_expired', request.url))
    }

    // Find parent profile with matching email and token
    const parentProfile = await prisma.parentProfile.findFirst({
      where: {
        email: email,
        verificationToken: token
      }
    })

    if (!parentProfile) {
      return NextResponse.redirect(new URL('/parent/login?error=invalid_verification', request.url))
    }

    // Update parent's email verification status
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    })

    console.log('✅ Parent email verified successfully for:', email)

    // Redirect to parent login with success message
    return NextResponse.redirect(new URL('/parent/login?verified=true', request.url))

  } catch (error) {
    console.error('Parent email verification error:', error)
    return NextResponse.redirect(new URL('/parent/login?error=verification_failed', request.url))
  }
}
