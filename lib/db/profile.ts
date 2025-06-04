
'use server'

import { prisma } from '../prisma'

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        student: true,
        mentor: true,
        institution: true
      }
    })

    return profile
  } catch (error) {
    console.error(`Error fetching user profile ${userId}:`, error)
    return null
  }
}

export async function updateUserProfile(userId: string, profileData: {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  tagline?: string
  professionalSummary?: string
  profileImageUrl?: string
  coverImageUrl?: string
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  timezone?: string
  availabilityStatus?: string
}) {
  try {
    // Filter out undefined values
    const cleanData = Object.fromEntries(
      Object.entries(profileData).filter(([_, value]) => value !== undefined)
    )
    
    console.log('Updating profile with data:', cleanData)
    
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: cleanData,
      include: {
        student: true,
        mentor: true,
        institution: true
      }
    })

    return updatedProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function updateStudentProfile(userId: string, studentData: {
  educationLevel?: string
  age_group?: string
  birthMonth?: string
  birthYear?: string
  personalityType?: string
  learningStyle?: string
  favoriteQuote?: string
}) {
  try {
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: userId },
      data: {
        educationLevel: studentData.educationLevel as any,
        age_group: studentData.age_group as any,
        birthMonth: studentData.birthMonth,
        birthYear: studentData.birthYear,
        personalityType: studentData.personalityType,
        learningStyle: studentData.learningStyle,
        favoriteQuote: studentData.favoriteQuote
      }
    })

    return updatedStudent
  } catch (error) {
    console.error('Error updating student profile:', error)
    throw error
  }
}
