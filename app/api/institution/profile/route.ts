import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function PATCH(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { overview, mission, coreValues, logoUrl, coverImageUrl } = body

    // Update institution profile
    const updatedProfile = await prisma.institutionProfile.update({
      where: { id: user.id },
      data: {
        overview: overview || null,
        mission: mission || null,
        coreValues: coreValues && coreValues.length > 0 ? coreValues : null,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null
      }
    })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating institution profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}