
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

    // Delete existing facilities
    await prisma.institutionFacilities.deleteMany({
      where: { institutionId: user.id }
    })

    // Create new facilities
    if (facilities && facilities.length > 0) {
      const facilitiesData = facilities.map((facility: any) => ({
        institutionId: user.id,
        name: facility.name,
        description: facility.description,
        imageUrl: facility.imageUrl || null,
        features: facility.features || []
      }))

      await prisma.institutionFacilities.createMany({
        data: facilitiesData
      })
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
