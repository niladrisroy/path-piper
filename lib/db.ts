import { supabase } from './supabase'

export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count')
    if (error) throw error
    console.log('Database connection successful:', data)
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Export supabase client for direct usage
export const db = supabase