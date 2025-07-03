
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Check if user already liked the post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    if (existingLike) {
      // Unlike the post
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })

      // Decrement likes count
      await prisma.feedPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      })

      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          userId: user.id,
          postId: postId
        }
      })

      // Increment likes count and update engagement score
      await prisma.feedPost.update({
        where: { id: postId },
        data: { 
          likesCount: { increment: 1 },
          engagementScore: { increment: 1 }
        }
      })

      return NextResponse.json({ success: true, liked: true })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json({ error: 'Failed to handle like' }, { status: 500 })
  }
}
