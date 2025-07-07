import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session cookie
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    const requestId = params.id

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the connection request to verify it exists and user is the receiver
    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true
      }
    })

    if (!connectionRequest) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 })
    }

    if (connectionRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to respond to this request' }, { status: 403 })
    }

    if (connectionRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 })
    }

    if (action === 'accept') {
      // Update connection request status to accepted
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' }
      })

      // Create a connection record
      await prisma.connection.create({
        data: {
          user1Id: connectionRequest.senderId,
          user2Id: connectionRequest.receiverId,
          connectionType: 'mutual',
          connectedAt: new Date()
        }
      })

      return NextResponse.json({ message: 'Connection request accepted' })
    } else {
      // Update connection request status to declined
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: 'declined' }
      })

      return NextResponse.json({ message: 'Connection request declined' })
    }

  } catch (error) {
    console.error('Error processing connection request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}