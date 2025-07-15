import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    let isBookmarked: boolean

    if (existingBookmark) {
      // Remove bookmark
      await prisma.postBookmark.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: postId
          }
        }
      })
      isBookmarked = false
    } else {
      // Add bookmark
      await prisma.postBookmark.create({
        data: {
          userId: user.id,
          postId: postId
        }
      })
      isBookmarked = true
    }

    // Get updated bookmarks count
    const bookmarksCount = await prisma.postBookmark.count({
      where: { postId }
    })

    return NextResponse.json({
      isBookmarked,
      bookmarksCount
    })
  } catch (error) {
    console.error('Error handling bookmark:', error)
    return NextResponse.json({ error: 'Failed to handle bookmark' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const postId = params.id

    // Check if post exists
    const post = await prisma.feedPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user already bookmarked the post
    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.postBookmark.delete({
        where: { id: existingBookmark.id }
      })

      return NextResponse.json({ success: true, bookmarked: false })
    } else {
      // Add bookmark
      await prisma.postBookmark.create({
        data: {
          userId: user.id,
          postId: postId
        }
      })

      return NextResponse.json({ success: true, bookmarked: true })
    }
  } catch (error) {
    console.error('Error handling bookmark:', error)
    return NextResponse.json({ error: 'Failed to handle bookmark' }, { status: 500 })
  }
}