
'use server'

import { prisma } from '../prisma'

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        student: true,
        mentor: true,
        institution: true,
        userInterests: {
          include: {
            interest: {
              include: {
                category: true
              }
            }
          }
        },
        userSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        },
        userLanguages: {
          include: {
            language: true
          }
        },
        userHobbies: {
          include: {
            hobby: true
          }
        },
        careerGoals: true,
        socialLinks: true,
        moodBoard: true,
        customBadges: true
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
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: profileData,
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
  ageGroup?: string
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
        age_group: studentData.ageGroup as any,
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
