
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
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const { reactionType } = await request.json()

    if (!reactionType) {
      return NextResponse.json({ error: 'Reaction type is required' }, { status: 400 })
    }

    // Check if post exists
    const post = await prisma.feedPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user already reacted to this post
    const existingReaction = await prisma.postReaction?.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    }).catch(() => null) // Handle if table doesn't exist yet

    if (existingReaction) {
      // Update existing reaction
      await prisma.postReaction?.update({
        where: { id: existingReaction.id },
        data: { reactionType }
      }).catch(() => {
        // If table doesn't exist, treat as new reaction
        return prisma.postLike.create({
          data: {
            userId: user.id,
            postId: postId
          }
        })
      })
    } else {
      // Create new reaction (fallback to like if reactions table doesn't exist)
      try {
        await prisma.postReaction?.create({
          data: {
            userId: user.id,
            postId: postId,
            reactionType
          }
        })
      } catch {
        // Fallback to creating a like
        await prisma.postLike.create({
          data: {
            userId: user.id,
            postId: postId
          }
        })
      }
    }

    // Increment engagement score
    await prisma.feedPost.update({
      where: { id: postId },
      data: { 
        engagementScore: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true, reactionType })
  } catch (error) {
    console.error('Error handling reaction:', error)
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 })
  }
}
