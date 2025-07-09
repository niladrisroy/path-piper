
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; trailId: string } }
) {
  try {
    const trailId = params.trailId

    // Get user from cookies
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    // Check if user already liked this trail
    const existingLike = await prisma.postLike.findFirst({
      where: {
        userId: user.id,
        postId: trailId
      }
    })

    if (existingLike) {
      // Unlike the trail
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })

      // Decrement likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: { 
          likesCount: { decrement: 1 },
          engagementScore: { decrement: 1 }
        }
      })

      return NextResponse.json({ success: true, liked: false })
    } else {
      // Like the trail
      await prisma.postLike.create({
        data: {
          userId: user.id,
          postId: trailId
        }
      })

      // Increment likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: { 
          likesCount: { increment: 1 },
          engagementScore: { increment: 1 }
        }
      })

      return NextResponse.json({ success: true, liked: true })
    }
  } catch (error) {
    console.error('Error handling trail like:', error)
    return NextResponse.json({ error: 'Failed to handle like' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> }
) {
  try {
    const { trailId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Check if user already liked this trail
    const existingLike = await prisma.postLike.findFirst({
      where: {
        postId: trailId,
        userId: user.id
      }
    })

    let liked = false

    if (existingLike) {
      // Unlike the trail
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })
      
      // Decrement likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })
    } else {
      // Like the trail
      await prisma.postLike.create({
        data: {
          postId: trailId,
          userId: user.id
        }
      })
      
      // Increment likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })
      
      liked = true
    }

    return NextResponse.json({ liked })
  } catch (error) {
    console.error('Error toggling trail like:', error)
    return NextResponse.json({ error: "Failed to toggle trail like" }, { status: 500 })
  }
}
