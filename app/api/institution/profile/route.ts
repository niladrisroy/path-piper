import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

const OPENAI_API_KEY = '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'

export async function GET(request: NextRequest) {
  try {
    console.log('🏛️ Institution profile GET request received')

    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get institution profile
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    const institutionProfile = profile.institution

    return NextResponse.json({ 
      profile: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        location: profile.location,
        institutionName: institutionProfile?.institutionName,
        institutionType: institutionProfile?.institutionType,
        website: institutionProfile?.website,
        logoUrl: institutionProfile?.logoUrl,
        coverImageUrl: institutionProfile?.coverImageUrl,
        overview: institutionProfile?.overview,
        mission: institutionProfile?.mission,
        coreValues: institutionProfile?.coreValues,
        verified: institutionProfile?.verified || false
      }
    })

  } catch (error) {
    console.error('Institution profile GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}

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