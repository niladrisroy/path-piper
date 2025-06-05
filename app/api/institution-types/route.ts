
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Fetching institution categories and types')

    const categories = await prisma.institutionCategory.findMany({
      include: {
        types: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`✅ Fetched ${categories.length} categories with types`)

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('❌ Error fetching institution types:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch institution types',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
