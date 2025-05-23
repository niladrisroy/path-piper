
import { supabase } from './supabase'

export async function testConnection() {
  try {
    // Test raw connection first
    // Test connection by querying the profiles table
    const { data, error } = await supabase.from('profiles').select('count')
    if (error) throw error
    
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export async function getUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getUserProfile(userId: string, type: 'student' | 'mentor' | 'institution') {
  try {
    const { data, error } = await supabase
      .from(`${type}_profiles`)
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching ${type} profile:`, error)
    return null
  }
}
