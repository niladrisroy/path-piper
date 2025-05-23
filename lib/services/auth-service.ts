
import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'
import { sendEmail } from '@/lib/email'

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
    // Check if user exists
    const existingProfile = await prisma.profile.findFirst({
      where: { id: data.email }
    })

    if (existingProfile) {
      return { success: false, error: 'Email already exists' }
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        id: data.email,
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

    // Create student profile
    const studentProfile = await prisma.studentProfile.create({
      data: {
        id: data.email,
        ageGroup: 'young_adult', // You may want to calculate this based on age
        educationLevel: 'high_school', // This should come from form data
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
