import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { updateUserProfile, getUserSocialLinks, updateUserSocialLinks, getUserProfile } from '@/lib/db/profile'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching social contact data')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch profile data and social links
    const profile = await getUserProfile(user.id)
    const socialLinks = await getUserSocialLinks(user.id)
    console.log('✅ Fetched profile and social links:', { email: profile?.email, phone: profile?.phone, socialLinksCount: socialLinks.length })

    return NextResponse.json({ 
      profile: {
        email: profile?.email || null,
        phone: profile?.phone || null
      },
      socialLinks 
    })

  } catch (error) {
    console.error('❌ Error fetching social contact data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social contact data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Saving social contact data')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, phone, socialLinks } = body

    console.log('📊 Received data:', { email, phone, socialLinksCount: socialLinks?.length || 0 })

    // Update profile contact info if provided
    if (email !== undefined || phone !== undefined) {
      const profileData: any = {}
      if (email !== undefined) profileData.email = email
      if (phone !== undefined) profileData.phone = phone

      await updateUserProfile(user.id, profileData)
      console.log('✅ Updated profile contact info')
    }

    // Update social links if provided
    if (socialLinks && Array.isArray(socialLinks)) {
      const updatedLinks = await updateUserSocialLinks(user.id, socialLinks)
      console.log('✅ Updated social links:', updatedLinks.length)

      return NextResponse.json({ 
        message: 'Social contact data saved successfully',
        socialLinks: updatedLinks
      })
    }

    return NextResponse.json({ message: 'Contact info saved successfully' })

  } catch (error) {
    console.error('❌ Error saving social contact data:', error)
    return NextResponse.json(
      { error: 'Failed to save social contact data' },
      { status: 500 }
    )
  }
}