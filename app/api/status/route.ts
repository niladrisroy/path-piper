import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasDatabaseUrl = !!process.env.DATABASE_URL

    console.log('Environment check:', {
      hasSupabaseUrl,
      hasServiceKey,
      hasDatabaseUrl,
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'undefined'
    })

    // Test Prisma connection
    const count = await prisma.profile.count()

    return NextResponse.json({
      prismaConnected: true,
      profileCount: count,
      environmentCheck: {
        hasSupabaseUrl,
        hasServiceKey,
        hasDatabaseUrl
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      prismaConnected: false,
      error: (error as Error).message,
      environmentCheck: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}