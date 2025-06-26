
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Decode token to get parent email and student ID
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const [parentEmail, studentId, timestamp] = decodedToken.split(':')

    if (!parentEmail || !studentId || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token format' },
        { status: 400 }
      )
    }

    // Get student profile to display name in success message
    const studentProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = parseInt(timestamp)
    const currentTime = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (currentTime - tokenTimestamp > twentyFourHours) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Find parent profile with matching email and token
    const parentProfile = await prisma.parentProfile.findFirst({
      where: {
        email: parentEmail,
        verificationToken: token
      }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token or parent email' },
        { status: 400 }
      )
    }

    // Update student's parent verification status
    await prisma.profile.update({
      where: { id: studentId },
      data: {
        parentVerified: true
      }
    })

    // Clear the verification token
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: {
        verificationToken: null
      }
    })

    // Return success response with HTML page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - PathPiper</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9fafb;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 16px;
            font-size: 24px;
          }
          .student-name {
            color: #14b8a6;
            font-weight: bold;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Account of <span class="student-name">${studentProfile.firstName} ${studentProfile.lastName}</span> Approved!</h1>
          <p>Thank you for approving your child's PathPiper account. <strong>${studentProfile.firstName}</strong> can now log in and start their learning journey!</p>
        </div>
      </body>
      </html>
      `,
      { 
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )

  } catch (error) {
    console.error('Parent verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
