
'use server'

import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'
import { sendEmail } from '@/lib/email'

export interface UserRegistrationData {
  firstName: string
  lastName: string
  email: string
  password: string
  birthMonth?: string
  birthYear?: string
  parentEmail?: string
  role: 'student' | 'mentor' | 'institution'
}

export async function registerStudent(data: UserRegistrationData) {
  try {
    const age = data.birthYear ? calculateAge(parseInt(data.birthYear)) : null;
    const needsParentApproval = age !== null && age < 16;

    // Create user profile
    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(), // Generate a UUID for the user 
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      }
    });

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        id: profile.id,
        ageGroup: 'young-adult', // You may want to determine this based on age
        educationLevel: 'undergraduate', // Default value, can be updated later
        parentEmail: data.parentEmail || null,
        parentVerified: false,
        onboardingCompleted: false
      }
    });

    // Send verification email logic goes here
    // if (needsParentApproval && data.parentEmail) {
    //   await sendEmail({
    //     to: data.parentEmail,
    //     subject: 'Parental Approval Required',
    //     text: `Your child ${data.firstName} has signed up for PathPiper and requires your approval.`
    //   });
    // }

    return { success: true, needsParentApproval, parentEmail: data.parentEmail };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}

export async function registerMentor(data: UserRegistrationData) {
  try {
    // Create user profile
    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(), // Generate a UUID for the user
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'mentor',
      }
    });

    // Create mentor profile
    await prisma.mentorProfile.create({
      data: {
        id: profile.id,
        profession: 'Not specified', // Default value
        verified: false,
        onboardingCompleted: false
      }
    });

    return { success: true };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}

export async function registerInstitution(data: UserRegistrationData) {
  try {
    // Create user profile
    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(), // Generate a UUID for the user
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'institution',
      }
    });

    // Create institution profile
    await prisma.institutionProfile.create({
      data: {
        id: profile.id,
        institutionName: data.firstName + ' ' + data.lastName, // Temporary, update during onboarding
        institutionType: 'Not specified',
        category: 'Not specified',
        verified: false,
        onboardingCompleted: false
      }
    });

    return { success: true };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}
