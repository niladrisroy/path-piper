
import { supabase } from './supabase'

export async function testConnection() {
  try {
    // Test raw connection first
    const { data, error: pingError } = await supabase.rpc('ping')
    if (pingError) throw pingError
    
    // Then test users table access
    const { data: userData, error: userError } = await supabase.from('users').select('count').single()
    if (userError && userError.code !== 'PGRST116') throw userError
    
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
