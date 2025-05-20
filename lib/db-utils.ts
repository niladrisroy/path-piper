
import { prisma, testPrismaConnection } from './prisma'
import { supabase, testSupabaseConnection } from './supabase'

export async function testDatabaseConnections() {
  try {
    const prismaResult = await testPrismaConnection()
    const supabaseResult = await testSupabaseConnection()
    
    console.log('Database Connection Results:', {
      prisma: prismaResult,
      supabase: supabaseResult
    })
    
    return {
      prisma: prismaResult,
      supabase: supabaseResult,
      success: prismaResult && supabaseResult
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return {
      prisma: false,
      supabase: false,
      success: false,
      error: error.message
    }
  }
}
