
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')

    if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group is required' }, { status: 400 })
    }

    console.log('🔍 Fetching skill categories for age group:', ageGroup)

    // Fetch skill categories and skills for the age group using Prisma
    const skillCategories = await prisma.skillCategory.findMany({
      where: { ageGroup: ageGroup as any },
      include: { 
        skills: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    console.log('✅ Found', skillCategories.length, 'skill categories for age group:', ageGroup)

    // Transform the data to match the expected format
    const transformedCategories = skillCategories.map(category => ({
      name: category.name,
      skills: category.skills.map(skill => ({
        id: skill.id,
        name: skill.name
      }))
    }))

    console.log('✅ Transformed categories:', transformedCategories.map(c => ({ name: c.name, skillCount: c.skills.length })))

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Error in GET /api/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
