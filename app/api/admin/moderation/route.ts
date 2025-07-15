
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin/moderator
    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'pending'
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: any = {}
    
    if (filter === 'pending') {
      whereClause.reviewStatus = 'pending'
    } else if (filter === 'reviewed') {
      whereClause.reviewStatus = { in: ['approved', 'rejected'] }
    } else if (filter === 'high_risk') {
      whereClause.riskScore = { gte: 15 }
    }

    if (priority) {
      whereClause.priority = priority
    }

    const items = await prisma.humanReviewQueue.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { queuedAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const totalCount = await prisma.humanReviewQueue.count({
      where: whereClause
    })

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching moderation queue:', error)
    return NextResponse.json({ error: 'Failed to fetch moderation queue' }, { status: 500 })
  }
}
