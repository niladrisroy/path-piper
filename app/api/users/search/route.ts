
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

    // Search for users excluding the current user and existing connections
    const searchResults = await prisma.profile.findMany({
      where: {
        AND: [
          {
            id: {
              not: user.id // Exclude current user
            }
          },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                bio: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          },
          // Exclude users who already have connection requests or connections
          {
            AND: [
              {
                receivedConnections: {
                  none: {
                    senderId: user.id
                  }
                }
              },
              {
                sentConnections: {
                  none: {
                    receiverId: user.id
                  }
                }
              },
              {
                connections1: {
                  none: {
                    user2Id: user.id
                  }
                }
              },
              {
                connections2: {
                  none: {
                    user1Id: user.id
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true,
        bio: true,
        location: true
      },
      take: 20, // Limit results
      orderBy: {
        firstName: 'asc'
      }
    })

    return NextResponse.json(searchResults)

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value
      
      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authData.user
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const role = searchParams.get('role') // Optional: filter by role

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    // Build the search query
    const whereClause: any = {
      AND: [
        {
          id: {
            not: user.id // Exclude current user from search results
          }
        },
        {
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              bio: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        }
      ]
    }

    // Add role filter if specified
    if (role && ['student', 'mentor', 'institution'].includes(role)) {
      whereClause.AND.push({
        role: role
      })
    }

    // Search for users
    const users = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true,
        bio: true,
        location: true
      },
      take: 20, // Limit results
      orderBy: [
        {
          firstName: 'asc'
        },
        {
          lastName: 'asc'
        }
      ]
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
