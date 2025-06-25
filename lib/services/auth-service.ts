"use server";

import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client - ONLY for auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase');
}

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

    // Calculate age group from birth data
    const calculateAgeGroup = (birthMonth: string | null, birthYear: string | null): string => {
      if (!birthMonth || !birthYear) return "young_adult";

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const birthYearNum = parseInt(birthYear);
      const birthMonthNum = parseInt(birthMonth);

      let ageInYears = currentYear - birthYearNum;
      if (currentMonth < birthMonthNum) {
        ageInYears--;
      }

      if (ageInYears < 5) {
        return "early_childhood";
      } else if (ageInYears < 11) {
        return "elementary";
      } else if (ageInYears < 13) {
        return "middle_school";
      } else if (ageInYears < 18) {
        return "high_school";
      } else {
        return "young_adult";
      }
    };

    const calculatedAgeGroup = calculateAgeGroup(data.birthMonth || "", data.birthYear || "");

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        id: profile.id,
        age_group: calculatedAgeGroup,
        educationLevel: "undergraduate", // Default value, can be updated later
        birthMonth: data.birthMonth || null,
        birthYear: data.birthYear || null,
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

export interface InstitutionRegistrationData extends UserRegistrationData {
  institutionData: {
    institutionName: string;
    institutionTypeId: number | null;
    category: string;
    website: string;
    logoUrl: string;
    coverImageUrl: string;
    description: string;
  };
}

export async function registerInstitution(data: InstitutionRegistrationData) {
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
        bio: data.institutionData.description || null,
      },
    });

    // Create institution profile with all required fields
    await prisma.institutionProfile.create({
      data: {
        id: profile.id,
        institutionName: data.institutionData.institutionName,
        institutionTypeId: data.institutionData.institutionTypeId,
        website: data.institutionData.website || null,
        logoUrl: data.institutionData.logoUrl || null,
        coverImageUrl: data.institutionData.coverImageUrl || null,
        verified: false,
        onboardingCompleted: false,
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

    // For students, determine onboarding completion by checking data presence
    let onboardingCompleted = false;
    if (profile.role === 'student') {
      try {
        // Check if user has minimum required data for all three essential sections
        const hasBasicInfo = profile.firstName && profile.lastName && profile.bio;
        
        // Check interests
        const interests = await prisma.userInterest.findMany({
          where: { userId: profile.id }
        });
        const hasInterests = interests.length > 0;
        
        // Check education
        const education = await prisma.studentEducationHistory.findMany({
          where: { studentId: profile.id }
        });
        const hasEducation = education.length > 0;
        
        onboardingCompleted = hasBasicInfo && hasInterests && hasEducation;
        
        console.log('🔍 Onboarding completion check:', {
          userId: profile.id,
          hasBasicInfo,
          hasInterests: `${interests.length} interests`,
          hasEducation: `${education.length} education entries`,
          onboardingCompleted
        });
      } catch (error) {
        console.error('Error checking onboarding completion:', error);
        onboardingCompleted = false;
      }
    } else if (profile.role === 'mentor' && profile.mentor) {
      onboardingCompleted = profile.mentor.onboardingCompleted || false;
    } else if (profile.role === 'institution' && profile.institution) {
      onboardingCompleted = profile.institution.onboardingCompleted || false;
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