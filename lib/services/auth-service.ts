"use server";

import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client - ONLY for auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthMonth?: string;
  birthYear?: string;
  parentEmail?: string;
  role: "student" | "mentor" | "institution";
}

export async function registerStudent(data: UserRegistrationData) {
  try {
    const age = data.birthYear ? calculateAge(parseInt(data.birthYear)) : null;
    const needsParentApproval = age !== null && age < 16;

    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "student",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "student",
      },
    });

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        id: profile.id,
        age_group: "young_adult", // You may want to determine this based on age
        educationLevel: "undergraduate", // Default value, can be updated later
        birthMonth: data.birthMonth || null,
        birthYear: data.birthYear || null,
        onboarding_completed: false, // Set as false by default so user goes through onboarding
      },
    });

    // Send verification email logic goes here
    // if (needsParentApproval && data.parentEmail) {
    //   await sendEmail({
    //     to: data.parentEmail,
    //     subject: 'Parental Approval Required',
    //     text: `Your child ${data.firstName} has signed up for PathPiper and requires your approval.`
    //   });
    // }

    return {
      success: true,
      needsParentApproval,
      parentEmail: data.parentEmail,
      userId: authData.user.id,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export async function registerMentor(data: UserRegistrationData) {
  try {
    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "mentor",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "mentor",
      },
    });

    // Create mentor profile
    await prisma.mentorProfile.create({
      data: {
        id: profile.id,
        profession: "Not specified", // Default value
        verified: false,
        onboarding_completed: false,
      },
    });

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export async function registerInstitution(data: UserRegistrationData) {
  try {
    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "institution",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "institution",
      },
    });

    // Create institution profile
    await prisma.institutionProfile.create({
      data: {
        id: profile.id,
        institutionName: data.firstName + " " + data.lastName, // Temporary, update during onboarding
        verified: false,
        onboarding_completed: false,
      },
    });

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export async function loginUser(data: LoginData) {
  try {
    // Use Supabase Auth for login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      throw new Error(authError.message || "Login failed");
    }

    if (!authData.user) {
      throw new Error("No user returned from login");
    }

    // Get user's profile with a single optimized query
    // Include the specific profile type based on role to get onboarding status in one query
    const profile = await prisma.profile.findUnique({
      where: { id: authData.user.id },
      include: {
        student: true,
        mentor: true,
        institution: true,
      },
    });

    if (!profile) {
      console.warn(
        `User ${authData.user.id} doesn't have a profile in the database`,
      );
      return {
        success: true,
        user: authData.user,
        role: authData.user.user_metadata?.role || "student",
        onboardingCompleted: false,
      };
    }

    // Get onboarding status from the included profile data
    let onboardingCompleted = false;
    if (profile.role === "student" && profile.student) {
      onboardingCompleted = Boolean(profile.student.onboarding_completed);
    } else if (profile.role === "mentor" && profile.mentor) {
      onboardingCompleted = Boolean(profile.mentor.onboarding_completed);
    } else if (profile.role === "institution" && profile.institution) {
      onboardingCompleted = Boolean(profile.institution.onboarding_completed);
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      role: profile.role,
      onboardingCompleted,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Login failed",
    };
  }
}