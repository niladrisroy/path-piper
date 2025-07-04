
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

    // Fetch faculty members for this institution
    const faculty = await prisma.institutionFaculty.findMany({
      where: { institutionId: user.id },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json({ faculty })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
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
    const { faculty } = body

    // Delete existing faculty for this institution
    await prisma.institutionFaculty.deleteMany({
      where: { institutionId: user.id }
    })

    // Insert new faculty members
    if (faculty && faculty.length > 0) {
      const facultyData = faculty.map((member: any, index: number) => ({
        institutionId: user.id,
        name: member.name,
        position: member.position,
        department: member.department || null,
        qualifications: member.qualifications || null,
        experience: member.experience ? parseInt(member.experience) : null,
        specialization: member.specialization || null,
        profileImage: member.profileImage || null,
        bio: member.bio || null,
        email: member.email || null,
        phone: member.phone || null,
        website: member.website || null,
        linkedin: member.linkedin || null,
        researchInterests: member.researchInterests || null,
        publicationsCount: member.publicationsCount ? parseInt(member.publicationsCount) : null,
        yearsAtInstitution: member.yearsAtInstitution ? parseInt(member.yearsAtInstitution) : null,
        officeLocation: member.officeLocation || null,
        officeHours: member.officeHours || null,
        isFeatured: member.isFeatured || false,
        displayOrder: index + 1,
        status: 'active'
      }))

      await prisma.institutionFaculty.createMany({
        data: facultyData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving faculty:', error)
    return NextResponse.json({ error: 'Failed to save faculty' }, { status: 500 })
  }
}
