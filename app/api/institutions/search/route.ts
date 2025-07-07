
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Search institutions by name
    const institutions = await prisma.institutionProfile.findMany({
      where: {
        institutionName: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            bio: true,
            location: true
          }
        }
      },
      take: 10
    })

    // Check existing connection requests for each institution
    const institutionIds = institutions.map(inst => inst.id)
    const existingRequests = await prisma.connectionRequest.findMany({
      where: {
        senderId: user.id,
        receiverId: { in: institutionIds }
      },
      select: {
        receiverId: true,
        status: true
      }
    })

    const requestMap = new Map(existingRequests.map(req => [req.receiverId, req.status]))

    // Add connection status to each institution
    const institutionsWithStatus = institutions.map(institution => ({
      id: institution.id,
      institutionName: institution.institutionName,
      institutionType: institution.institutionType,
      logoUrl: institution.logoUrl,
      website: institution.website,
      overview: institution.overview,
      profile: institution.profile,
      connectionStatus: requestMap.get(institution.id) || null
    }))

    return NextResponse.json(institutionsWithStatus)

  } catch (error) {
    console.error('Error searching institutions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
