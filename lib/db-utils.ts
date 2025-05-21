
import { testSupabaseConnection } from './supabase'
import { testDrizzleConnection } from './db'

export async function testDatabaseConnections() {
  try {
    const [supabaseResult, drizzleResult] = await Promise.all([
      testSupabaseConnection(),
      testDrizzleConnection()
    ])
    
    console.log('Database Connection Results:', {
      supabase: supabaseResult,
      drizzle: drizzleResult
    })
    
    return {
      supabase: supabaseResult,
      drizzle: drizzleResult,
      success: supabaseResult && drizzleResult
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return {
      supabase: false,
      drizzle: false,
      success: false,
      error: error.message
    }
  }
}
