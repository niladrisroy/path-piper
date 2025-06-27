
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

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

    if (existingParent) {
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

    // Create parent profile in database
    const parentProfile = await prisma.parentProfile.create({
      data: {
        name: name,
        email: email,
        authId: authData.user.id,
      }
    })

    console.log('Parent profile created:', parentProfile.id)

    return NextResponse.json({
      success: true,
      parentId: parentProfile.id.toString()
    })

  } catch (error) {
    console.error('Parent registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
