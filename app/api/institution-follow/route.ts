
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.institutionFollowConnection.findUnique({
      where: {
        senderId_receiverId: {
          senderId: user.id,
          receiverId: institutionId
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this institution' }, { status: 400 })
    }

    // Create follow connection
    const follow = await prisma.institutionFollowConnection.create({
      data: {
        senderId: user.id,
        receiverId: institutionId
      }
    })

    return NextResponse.json({ success: true, follow })
  } catch (error) {
    console.error('Error following institution:', error)
    return NextResponse.json({ error: 'Failed to follow institution' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Delete follow connection
    await prisma.institutionFollowConnection.delete({
      where: {
        senderId_receiverId: {
          senderId: user.id,
          receiverId: institutionId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing institution:', error)
    return NextResponse.json({ error: 'Failed to unfollow institution' }, { status: 500 })
  }
}
