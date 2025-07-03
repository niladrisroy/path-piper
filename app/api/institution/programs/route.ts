
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

    // Get programs for this institution
    const programs = await prisma.institutionProgram.findMany({
      where: { institutionId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        institutionId: true,
        name: true,
        type: true,
        level: true,
        durationValue: true,
        durationType: true,
        description: true,
        eligibility: true,
        learningOutcomes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, programs })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
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
    const { programs } = body

    if (!programs || !Array.isArray(programs)) {
      return NextResponse.json({ error: 'Programs array is required' }, { status: 400 })
    }

    // Delete existing programs for this institution
    await prisma.institutionProgram.deleteMany({
      where: { institutionId: user.id }
    })

    // Create new programs
    const createdPrograms = []
    for (const program of programs) {
      const createdProgram = await prisma.institutionProgram.create({
        data: {
          institutionId: user.id,
          name: program.name,
          type: program.type === 'other' ? program.typeCustom : program.type,
          level: program.level === 'custom' ? program.levelCustom : program.level,
          durationValue: parseInt(program.durationValue || program.duration) || 1,
          durationType: program.durationType === 'custom' ? program.durationCustom : program.durationType,
          description: program.description,
          eligibility: program.eligibility || null,
          learningOutcomes: program.outcomes || null
        }
      })
      createdPrograms.push(createdProgram)
    }

    return NextResponse.json({ success: true, programs: createdPrograms })
  } catch (error) {
    console.error('Error saving programs:', error)
    return NextResponse.json({ error: 'Failed to save programs' }, { status: 500 })
  }
}
