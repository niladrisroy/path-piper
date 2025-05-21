
import { supabase } from '../supabase'
import { calculateAge } from '../utils'

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

export async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error
  }

  return !!data
}

export async function sendParentApprovalEmail(studentEmail: string, parentEmail: string) {
  // TODO: Implement email sending logic via your email service
  // For now, we'll simulate success
  return { success: true }
}

export async function registerUser(data: UserRegistrationData) {
  try {
    // Check if email exists
    const emailExists = await checkEmailExists(data.email)
    if (emailExists) {
      return { success: false, error: 'Email already exists' }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role
        },
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    })

    if (authError) throw authError

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
        const totalMonths = calculateAge(parseInt(data.birthMonth), parseInt(data.birthYear))
        const needsParentApproval = totalMonths < 192

        const { error: studentError } = await supabase
          .from('student_profiles')
          .insert([{
            user_id: authData.user.id,
            birth_month: parseInt(data.birthMonth),
            birth_year: parseInt(data.birthYear),
            parent_email: needsParentApproval ? data.parentEmail : null,
            parent_approval_status: needsParentApproval ? 'pending' : 'not_required',
            onboarding_completed: false
          }])

        if (studentError) throw studentError

        // Send parent approval email if needed
        if (needsParentApproval && data.parentEmail) {
          await sendParentApprovalEmail(data.email, data.parentEmail)
        }

        return { 
          success: true, 
          user: authData.user,
          needsParentApproval,
          parentEmail: data.parentEmail
        }
      }

      return { success: true, user: authData.user }
    }

    throw new Error('Failed to create user')
  } catch (error: any) {
    console.error('Registration error:', error)
    return { 
      success: false, 
      error: error.message || 'Registration failed'
    }
  }
}
