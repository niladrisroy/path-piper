
import { supabase } from '../supabase'

export type UserRegistrationData = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'institution'
  birthMonth?: string
  birthYear?: string
  parentEmail?: string
}

export async function registerUser(data: UserRegistrationData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role
        }
      }
    })

    if (authError) throw authError

    // Create profile based on role
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])

      if (profileError) throw profileError

      // If student, store additional info
      if (data.role === 'student' && data.birthMonth && data.birthYear) {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .insert([{
            user_id: authData.user.id,
            birth_month: parseInt(data.birthMonth),
            birth_year: parseInt(data.birthYear),
            parent_email: data.parentEmail,
            onboarding_completed: false
          }])

        if (studentError) throw studentError
      }

      return { success: true, user: authData.user }
    }

    throw new Error('Failed to create user')
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error }
  }
}
