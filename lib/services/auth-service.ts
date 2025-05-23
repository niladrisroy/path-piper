
'use server'

import { prisma } from '@/lib/prisma'
import { calculateAge } from '@/lib/utils'
import { sendEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'student'
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
      }
    });

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        id: profile.id,
        ageGroup: 'young_adult', // You may want to determine this based on age
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

    return { success: true, needsParentApproval, parentEmail: data.parentEmail, userId: authData.user.id };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}

export async function registerMentor(data: UserRegistrationData) {
  try {
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'mentor'
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
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

    return { success: true, userId: authData.user.id };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}

export async function registerInstitution(data: UserRegistrationData) {
  try {
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'institution'
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
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

    return { success: true, userId: authData.user.id };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: (error as Error).message || 'Registration failed' };
  }
}
