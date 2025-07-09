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

    // Verify trail exists
    const trail = await prisma.feedPost.findUnique({
      where: { id: trailId, isTrail: true }
    })

    if (!trail) {
      return NextResponse.json({ error: "Trail not found" }, { status: 404 })
    }

    // Check if user already liked this trail
    const existingLike = await prisma.postLike.findFirst({
      where: {
        userId: user.id,
        postId: trailId
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