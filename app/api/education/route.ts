import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching education history')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
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
      institutionType: entry.institutionTypeId ? entry.institutionTypeId.toString() : '',
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
    console.log('💾 Saving education history')

    // Get user from session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.log('❌ Authentication failed')
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
          institutionTypeId: entry.institutionType ? parseInt(entry.institutionType) : null,
          degreeProgram: entry.degree || null,
          fieldOfStudy: entry.fieldOfStudy,
          subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
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
    console.error('❌ Error saving education history:', error)
    return NextResponse.json({ 
      error: 'Failed to save education history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}