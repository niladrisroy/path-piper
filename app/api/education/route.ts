
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get the token from cookies
    const authCookie = request.cookies.get('sb-access-token')?.value
    
    if (!authCookie) {
      return null
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(authCookie)
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch education history for the authenticated user using Prisma
    const educationHistory = await prisma.studentEducationHistory.findMany({
      where: {
        studentId: user.id
      },
      orderBy: {
        startDate: 'desc'
      },
      include: {
        institutionType: {
          include: {
            category: true
          }
        }
      }
    })

    // Transform database fields to match the frontend interface
    const transformedEducation = educationHistory.map(entry => ({
      id: entry.id,
      institutionName: entry.institutionName,
      institutionCategory: entry.institutionType?.category?.slug || '',
      institutionType: entry.institutionTypeId || '',
      degree: entry.degreeProgram || '',
      fieldOfStudy: entry.fieldOfStudy || '',
      startDate: entry.startDate ? entry.startDate.toISOString().split('T')[0] : '',
      endDate: entry.endDate ? entry.endDate.toISOString().split('T')[0] : '',
      isCurrent: entry.isCurrent || false,
      grade: entry.gradeLevel || '',
      description: entry.description || ''
    }))

    return NextResponse.json({ education: transformedEducation })
  } catch (error) {
    console.error('Error in GET /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { education } = await request.json()

    if (!Array.isArray(education)) {
      return NextResponse.json({ error: 'Education data must be an array' }, { status: 400 })
    }

    // Use a transaction to delete existing and insert new education entries
    await prisma.$transaction(async (tx) => {
      // First, delete existing education history for this user
      await tx.studentEducationHistory.deleteMany({
        where: {
          studentId: user.id
        }
      })

      // Insert new education entries if any
      if (education.length > 0) {
        const educationToInsert = education.map(entry => ({
          studentId: user.id,
          institutionName: entry.institutionName,
          institutionTypeId: entry.institutionType || null,
          degreeProgram: entry.degree || null,
          fieldOfStudy: entry.fieldOfStudy,
          startDate: entry.startDate ? new Date(entry.startDate) : null,
          endDate: entry.endDate ? new Date(entry.endDate) : null,
          isCurrent: entry.isCurrent || false,
          gradeLevel: entry.grade || null,
          description: entry.description || null
        }))

        await tx.studentEducationHistory.createMany({
          data: educationToInsert
        })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Education history saved successfully' 
    })

  } catch (error) {
    console.error('Error in POST /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
