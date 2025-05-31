
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch user's goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { goals } = await request.json()

    if (!Array.isArray(goals)) {
      return NextResponse.json({ error: 'Goals must be an array' }, { status: 400 })
    }

    // Delete existing goals for this user
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing goals:', deleteError)
      return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 })
    }

    // Insert new goals
    if (goals.length > 0) {
      const goalsToInsert = goals.map(goal => ({
        user_id: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false
      }))

      const { data: insertedGoals, error: insertError } = await supabase
        .from('goals')
        .insert(goalsToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting goals:', insertError)
        return NextResponse.json({ error: 'Failed to save goals' }, { status: 500 })
      }

      console.log(`✅ Successfully saved ${insertedGoals.length} goals for user ${user.id}`)
      return NextResponse.json({ 
        message: 'Goals saved successfully', 
        goals: insertedGoals 
      })
    }

    return NextResponse.json({ message: 'Goals cleared successfully', goals: [] })
  } catch (error) {
    console.error('Goals save API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
