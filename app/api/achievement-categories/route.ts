
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.achievementCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching achievement categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievement categories' },
      { status: 500 }
    )
  }
}
