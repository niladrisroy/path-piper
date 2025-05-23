
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function GET() {
  let prismaConnected = false
  let supabaseConnected = false

  // Check Prisma connection
  try {
    // Test query to check connection
    await prisma.$queryRaw`SELECT 1 as result`
    prismaConnected = true
  } catch (error) {
    console.error('Prisma connection failed:', error)
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }

  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('profiles').select('count')
    if (!error) {
      supabaseConnected = true
    }
  } catch (error) {
    console.error('Supabase connection failed:', error)
  }

  return NextResponse.json({
    prismaConnected,
    supabaseConnected,
    timestamp: new Date().toISOString()
  })
}
