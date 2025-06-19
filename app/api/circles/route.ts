
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's circle badges with member counts
    const circles = await prisma.circleBadge.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          {
            memberships: {
              some: {
                userId: user.id,
                status: 'active'
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        memberships: {
          where: { status: 'active' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            memberships: {
              where: { status: 'active' }
            }
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(circles)
  } catch (error) {
    console.error('Error fetching circles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Circle name is required' }, { status: 400 })
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Circle name too long' }, { status: 400 })
    }

    const circle = await prisma.circleBadge.create({
      data: {
        creatorId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'users',
        isDefault: false
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        memberships: {
          where: { status: 'active' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            memberships: {
              where: { status: 'active' }
            }
          }
        }
      }
    })

    return NextResponse.json(circle, { status: 201 })
  } catch (error) {
    console.error('Error creating circle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
