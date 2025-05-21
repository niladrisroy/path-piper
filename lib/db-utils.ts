
import { testSupabaseConnection } from './supabase'

export async function testDatabaseConnections() {
  try {
    const supabaseResult = await testSupabaseConnection()
    
    console.log('Database Connection Results:', {
      supabase: supabaseResult
    })
    
    return {
      supabase: supabaseResult,
      success: supabaseResult
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return {
      supabase: false,
      success: false,
      error: error.message
    }
  }
}
