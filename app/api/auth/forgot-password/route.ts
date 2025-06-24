
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in our database
    const profile = await prisma.profile.findFirst({
      where: { 
        email: email.toLowerCase()
      }
    })

    // Always return success for security (don't reveal if email exists)
    if (!profile) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent password reset instructions.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: profile.id,
        token: resetToken,
        expiresAt: resetTokenExpiry,
        used: false
      }
    })

    // Create reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Send email using the existing email service
    const emailResult = await sendEmail(
      'password-reset',
      email,
      {
        userName: profile.firstName,
        resetLink: resetUrl
      }
    )

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, we have sent password reset instructions.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
