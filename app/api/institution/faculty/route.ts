
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
      const facultyData = faculty.map((member: any, index: number) => {
        // Helper function to safely parse integers
        const safeParseInt = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null
          const parsed = parseInt(String(value))
          return isNaN(parsed) ? null : parsed
        }

        // Helper function to safely handle string fields
        const safeString = (value: any): string | null => {
          if (value === null || value === undefined) return null
          const str = String(value).trim()
          return str === '' ? null : str
        }

        return {
          institutionId: user.id,
          name: safeString(member.name) || 'Unknown',
          position: safeString(member.position) || 'Staff',
          department: safeString(member.department),
          qualifications: safeString(member.qualifications),
          experience: safeParseInt(member.experience),
          specialization: safeString(member.specialization),
          profileImage: safeString(member.profileImage),
          bio: safeString(member.bio),
          email: safeString(member.email),
          phone: safeString(member.phone),
          website: safeString(member.website),
          linkedin: safeString(member.linkedin),
          researchInterests: safeString(member.researchInterests),
          publicationsCount: safeParseInt(member.publicationsCount),
          yearsAtInstitution: safeParseInt(member.yearsAtInstitution),
          officeLocation: safeString(member.officeLocation),
          officeHours: safeString(member.officeHours),
          isFeatured: Boolean(member.isFeatured),
          displayOrder: index + 1,
          status: 'active'
        }
      })

      console.log('Faculty data to insert:', JSON.stringify(facultyData, null, 2))

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
