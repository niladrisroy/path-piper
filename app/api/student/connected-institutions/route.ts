
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

    // Get connected institutions (where connection is accepted)
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      },
      include: {
        user1: {
          include: {
            institution: true
          }
        },
        user2: {
          include: {
            institution: true
          }
        }
      }
    })

    // Filter for institution connections and get the institution data
    const connectedInstitutions = connections
      .map(connection => {
        const institutionProfile = connection.user1Id === user.id 
          ? (connection.user2.role === 'institution' ? connection.user2 : null)
          : (connection.user1.role === 'institution' ? connection.user1 : null)
        
        if (institutionProfile && institutionProfile.institution) {
          return {
            id: institutionProfile.id,
            institutionName: institutionProfile.institution.institutionName,
            institutionType: institutionProfile.institution.institutionType,
            logoUrl: institutionProfile.institution.logoUrl,
            website: institutionProfile.institution.website,
            verified: institutionProfile.institution.verified,
            connectedAt: connection.createdAt
          }
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json(connectedInstitutions)

  } catch (error) {
    console.error('Error fetching connected institutions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
