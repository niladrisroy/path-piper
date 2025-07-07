
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

    return NextResponse.json({ facilities })
  } catch (error) {
    console.error('Error fetching institution facilities:', error)
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

    if (facilities && facilities.length > 0) {
      for (const facility of facilities) {
        // Skip empty facilities
        if (!facility.name || !facility.name.trim()) {
          continue
        }

        const facilityData = {
          institutionId: user.id,
          name: facility.name,
          description: facility.description || '',
          imageUrl: facility.images && facility.images.length > 0 && facility.images[0] ? facility.images[0] : null,
          features: [
            ...(facility.features || []).filter((f: string) => f.trim() !== ''),
            ...(facility.capacity ? [`Capacity: ${facility.capacity}`] : []),
            ...(facility.availability ? [`Availability: ${facility.availability}`] : [])
          ]
        }

        if (facility.id && facility.id !== '') {
          // Update existing facility
          await prisma.institutionFacilities.update({
            where: { 
              id: facility.id,
              institutionId: user.id // Ensure user owns this facility
            },
            data: facilityData
          })
        } else {
          // Create new facility
          await prisma.institutionFacilities.create({
            data: facilityData
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution facilities:', error)
    return NextResponse.json({ error: 'Failed to save facilities' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('id')

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID required' }, { status: 400 })
    }

    await prisma.institutionFacilities.delete({
      where: { 
        id: facilityId,
        institutionId: user.id // Ensure user can only delete their own facilities
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting facility:', error)
    return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 })
  }
}
