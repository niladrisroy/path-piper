
import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
