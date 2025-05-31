
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current skills with skill details
    const { data: userSkills, error } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        skills (
          id,
          name,
          skill_categories (
            name,
            age_group
          )
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user skills:', error)
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }

    return NextResponse.json({ skills: userSkills || [] })
  } catch (error) {
    console.error('Error in GET /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skills } = await request.json()

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 })
    }

    // First, delete existing user skills to replace them
    const { error: deleteError } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing skills:', deleteError)
      return NextResponse.json({ error: 'Failed to update skills' }, { status: 500 })
    }

    // Insert new skills if any are provided
    if (skills.length > 0) {
      const skillsData = skills.map(skill => ({
        user_id: user.id,
        skill_id: skill.id,
        proficiency_level: skill.level
      }))

      const { error: insertError } = await supabase
        .from('user_skills')
        .insert(skillsData)

      if (insertError) {
        console.error('Error inserting skills:', insertError)
        return NextResponse.json({ error: 'Failed to save skills' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
