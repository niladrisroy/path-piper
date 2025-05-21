
import { supabase } from './supabase'

export async function testDatabaseConnections() {
  try {
    const { data, error } = await supabase.from('profiles').select('count')
    if (error) throw error
    
    console.log('Database Connection Result:', {
      supabase: true
    })
    
    return {
      supabase: true,
      success: true
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
