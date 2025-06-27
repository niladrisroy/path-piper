
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if parent already exists
    const existingParent = await prisma.parentProfile.findFirst({
      where: { email: email }
    })

    if (existingParent && existingParent.auth_id) {
      // Parent profile exists and already has auth_id (fully registered)
      return NextResponse.json(
        { success: false, error: 'Account with this email already exists' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'parent'
      }
    })

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Generate email verification token
    const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    let parentProfile;
    
    if (existingParent) {
      // Update existing parent profile with auth_id and verification details
      console.log('🔄 Updating existing parent profile for:', email);
      parentProfile = await prisma.parentProfile.update({
        where: { id: existingParent.id },
        data: {
          name: name, // Update name in case it was different
          auth_id: authData.user.id,
          emailVerified: false,
          verificationToken: verificationToken,
        }
      })
      console.log('✅ Parent profile updated with ID:', parentProfile.id);
    } else {
      // Create new parent profile in database with email_verified as false
      console.log('✨ Creating new parent profile for:', email);
      parentProfile = await prisma.parentProfile.create({
        data: {
          name: name,
          email: email,
          auth_id: authData.user.id,
          emailVerified: false,
          verificationToken: verificationToken,
        }
      })
      console.log('✅ Parent profile created with ID:', parentProfile.id);
    }

    // Send email verification email
    try {
      const baseUrl = 'https://pathpiper.replit.app';
      const verificationLink = `${baseUrl}/api/parent/verify-email?token=${verificationToken}`;
      
      await sendEmail(
        'parent-email-verification',
        email,
        {
          parentName: name,
          verificationLink: verificationLink
        }
      );
      console.log('📧 Parent email verification sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send parent email verification:', emailError);
      // Continue with registration even if email fails
    }

    // After successful registration, set parent_verified to true for their children
    await prisma.profile.updateMany({
      where: { parentId: parentProfile.id },
      data: { parentVerified: true }
    })
    
    console.log('✅ Parent registration successful - setting parent_verified to TRUE for children')

    return NextResponse.json({
      success: true,
      parentId: parentProfile.id.toString(),
      message: 'Account created successfully! Please check your email to verify your account.'
    })

  } catch (error) {
    console.error('Parent registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
