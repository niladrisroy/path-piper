
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session from cookies
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const connectionId = params.id

    // Find the connection first to ensure user is authorized to delete it
    const connection = await prisma.connections.findUnique({
      where: { id: connectionId }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Check if the current user is part of this connection
    if (connection.user1_id !== user.id && connection.user2_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this connection' }, { status: 403 })
    }

    // Delete the connection
    await prisma.connections.delete({
      where: { id: connectionId }
    })

    return NextResponse.json({ message: 'Connection removed successfully' })

  } catch (error) {
    console.error('Error removing connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
