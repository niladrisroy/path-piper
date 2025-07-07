
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

    // Fetch facilities for this institution
    const facilities = await prisma.institutionFacilities.findMany({
      where: { institutionId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, facilities })
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
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
    const { facilities } = body

    // Delete existing facilities and insert new ones
    await prisma.institutionFacilities.deleteMany({
      where: { institutionId: user.id }
    })

    // Insert new facilities
    if (facilities && facilities.length > 0) {
      await prisma.institutionFacilities.createMany({
        data: facilities.map((facility: any) => ({
          institutionId: user.id,
          name: facility.name,
          type: facility.type,
          description: facility.description,
          capacity: facility.capacity || null,
          features: facility.features || null,
          images: facility.images || null,
          availability: facility.availability || null
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving facilities:', error)
    return NextResponse.json({ error: 'Failed to save facilities' }, { status: 500 })
  }
}
