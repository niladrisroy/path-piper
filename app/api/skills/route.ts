
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group is required' }, { status: 400 })
    }

    // Fetch skill categories and skills for the age group
    const { data: skillCategories, error } = await supabase
      .from('skill_categories')
      .select(`
        id,
        name,
        age_group,
        skills (
          id,
          name
        )
      `)
      .eq('age_group', ageGroup)
      .order('name')

    if (error) {
      console.error('Error fetching skills:', error)
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedCategories = skillCategories?.map(category => ({
      name: category.name,
      skills: category.skills?.map(skill => skill.name) || []
    })) || []

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Error in GET /api/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
