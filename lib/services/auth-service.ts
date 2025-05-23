
import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'
import { sendEmail } from '@/lib/email'
// We still need supabase for auth, but not for database operations
import { supabase } from '@/lib/supabase'

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

export async function registerStudent(data: UserRegistrationData) {
  try {
    // First create Supabase auth user (keep this as it's auth, not database)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: 'student'
        }
      }
    })

    if (authError) {
      console.error('Auth registration failed:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Auth user creation failed' }
    }

    // Create profile with auth user ID using Prisma
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      }
    })

    // Calculate age if birth date is provided
    let needsParentApproval = false
    if (data.birthMonth && data.birthYear) {
      const birthDate = new Date(
        parseInt(data.birthYear),
        parseInt(data.birthMonth) - 1
      )
      const age = calculateAge(birthDate)
      needsParentApproval = age < 16
    }

    // Create student profile using Prisma
    const studentProfile = await prisma.studentProfile.create({
      data: {
        id: authData.user.id,
        ageGroup: 'young_adult',
        educationLevel: 'high_school',
        parentEmail: needsParentApproval ? data.parentEmail : null,
        parentVerified: false,
      }
    })

    // Send verification email to parent if needed
    if (needsParentApproval && data.parentEmail) {
      try {
        await sendEmail('parent-approval', data.parentEmail, {
          studentEmail: data.email,
          studentName: `${data.firstName} ${data.lastName}`
        })
      } catch (error) {
        console.error('Failed to send parent approval email:', error)
      }
    }

    return {
      success: true,
      needsParentApproval,
      parentEmail: data.parentEmail
    }

  } catch (error: any) {
    console.error('Registration failed:', error)
    return {
      success: false,
      error: error.message || 'Registration failed'
    }
  }
}
