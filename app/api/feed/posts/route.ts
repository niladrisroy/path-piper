
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { content, imageUrl, parentPostId, isTrail = false } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // For regular posts, enforce 300 character limit
    if (!isTrail && content.length > 300) {
      return NextResponse.json({ 
        error: 'Content exceeds 300 characters. Consider creating a trail instead.',
        suggestTrail: true 
      }, { status: 400 })
    }

    // If it's a trail, get the next trail order
    let trailOrder = null
    if (isTrail && parentPostId) {
      const lastTrail = await prisma.feedPost.findFirst({
        where: { parentPostId },
        orderBy: { trailOrder: 'desc' }
      })
      trailOrder = (lastTrail?.trailOrder || 0) + 1
    }

    const post = await prisma.feedPost.create({
      data: {
        userId: user.id,
        content,
        imageUrl,
        isTrail,
        parentPostId,
        trailOrder,
      },
      include: {
        author: true,
        trails: {
          orderBy: { trailOrder: 'asc' },
          include: { author: true }
        }
      }
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.feedPost.findMany({
      where: { isTrail: false }, // Only get main posts, not trails
      include: {
        author: true,
        trails: {
          orderBy: { trailOrder: 'asc' },
          include: { author: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
