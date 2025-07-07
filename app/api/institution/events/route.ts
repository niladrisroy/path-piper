
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch events for this institution
    const events = await prisma.institutionEvents.findMany({
      where: { institutionId: user.id },
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching institution events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { events } = body

    // Delete existing events for this institution
    await prisma.institutionEvents.deleteMany({
      where: { institutionId: user.id }
    })

    // Insert new events
    if (events && events.length > 0) {
      const validEvents = events.filter((event: any) => 
        event.title && event.description && event.eventType && event.startDate
      )

      if (validEvents.length > 0) {
        await prisma.institutionEvents.createMany({
          data: validEvents.map((event: any) => ({
            institutionId: user.id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: new Date(event.startDate),
            endDate: event.endDate ? new Date(event.endDate) : null,
            location: event.location || null,
            imageUrl: event.imageUrl || null,
            registrationUrl: event.registrationUrl || null
          }))
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution events:', error)
    return NextResponse.json({ error: 'Failed to save events' }, { status: 500 })
  }
}
