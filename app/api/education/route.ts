
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/db/auth'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Fetch education history for the authenticated user
    const { data: educationHistory, error } = await supabase
      .from('student_education_history')
      .select('*')
      .eq('student_id', user.id)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching education history:', error)
      return NextResponse.json({ error: 'Failed to fetch education history' }, { status: 500 })
    }

    // Transform database fields to match the frontend interface
    const transformedEducation = educationHistory?.map(entry => ({
      id: entry.id,
      institutionName: entry.institution_name,
      institutionCategory: entry.institution_type_id ? 'traditional-educational' : '', // Default category
      institutionType: entry.institution_type_id || '',
      degree: entry.degree_program || '',
      fieldOfStudy: entry.field_of_study || '',
      startDate: entry.start_date || '',
      endDate: entry.end_date || '',
      isCurrent: entry.is_current || false,
      grade: entry.grade_level || '',
      description: entry.description || ''
    })) || []

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

    const supabase = createClient()

    // First, delete existing education history for this user
    const { error: deleteError } = await supabase
      .from('student_education_history')
      .delete()
      .eq('student_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing education:', deleteError)
      return NextResponse.json({ error: 'Failed to update education history' }, { status: 500 })
    }

    // Insert new education entries
    if (education.length > 0) {
      const educationToInsert = education.map(entry => ({
        student_id: user.id,
        institution_name: entry.institutionName,
        institution_type_id: entry.institutionType || null,
        degree_program: entry.degree,
        field_of_study: entry.fieldOfStudy,
        start_date: entry.startDate || null,
        end_date: entry.endDate || null,
        is_current: entry.isCurrent,
        grade_level: entry.grade,
        description: entry.description
      }))

      const { data: insertedEducation, error: insertError } = await supabase
        .from('student_education_history')
        .insert(educationToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting education:', insertError)
        return NextResponse.json({ error: 'Failed to save education history' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        education: insertedEducation,
        message: 'Education history saved successfully' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      education: [],
      message: 'Education history cleared successfully' 
    })

  } catch (error) {
    console.error('Error in POST /api/education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
