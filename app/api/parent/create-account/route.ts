
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find parent profile
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent profile not found' },
        { status: 404 }
      )
    }

    if (parentProfile.authId) {
      return NextResponse.json(
        { success: false, error: 'Account already exists for this email' },
        { status: 400 }
      )
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'parent',
        parent_id: parentProfile.id
      }
    })

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Update parent profile with auth ID
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: { authId: authData.user.id }
    })

    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    })

    if (signInError) {
      console.error('Sign in error:', signInError)
      return NextResponse.json(
        { success: false, error: 'Account created but sign in failed' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: signInData.user,
      parentId: parentProfile.id
    })

    // Set auth cookies
    if (signInData.session) {
      response.cookies.set('sb-access-token', signInData.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: signInData.session.expires_in
      })
      
      response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    return response

  } catch (error) {
    console.error('Parent account creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
