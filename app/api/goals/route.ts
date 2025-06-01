
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Fetch user's goals using Prisma
    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { goals } = await request.json()

    if (!Array.isArray(goals)) {
      return NextResponse.json({ error: 'Goals must be an array' }, { status: 400 })
    }

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Delete existing goals for this user using Prisma
    await prisma.goal.deleteMany({
      where: {
        userId: user.id
      }
    })

    // Insert new goals using Prisma
    if (goals.length > 0) {
      const goalsToInsert = goals.map(goal => ({
        userId: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false
      }))

      const insertedGoals = await prisma.goal.createMany({
        data: goalsToInsert
      })

      console.log(`✅ Successfully saved ${insertedGoals.count} goals for user ${user.id}`)
      return NextResponse.json({ 
        message: 'Goals saved successfully', 
        count: insertedGoals.count 
      })
    }

    return NextResponse.json({ message: 'Goals cleared successfully', goals: [] })
  } catch (error) {
    console.error('Goals save API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
