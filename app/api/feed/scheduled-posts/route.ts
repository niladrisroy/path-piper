
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-access-token')
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken.value)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const { 
      content, 
      imageUrl, 
      scheduledFor,
      postType = "GENERAL",
      tags = [],
      subjects = [],
      achievementType,
      projectCategory,
      difficultyLevel
    } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
    }

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        content,
        imageUrl,
        scheduledFor: scheduledDate,
        postType,
        tags,
        subjects,
        achievementType,
        projectCategory,
        difficultyLevel,
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({ success: true, scheduledPost })
  } catch (error) {
    console.error('Scheduled post creation error:', error)
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-access-token')
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken.value)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: { 
        userId: user.id,
        status: 'SCHEDULED'
      },
      orderBy: { scheduledFor: 'asc' }
    })

    return NextResponse.json({ scheduledPosts })
  } catch (error) {
    console.error('Scheduled posts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduled posts' }, { status: 500 })
  }
}
