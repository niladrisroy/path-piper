"use server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase-types"

// Create a Supabase admin client with the service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createUserProfiles(
  userId: string,
  firstName: string,
  lastName: string,
  ageGroup: string,
  parentEmail: string | null,
) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Supabase environment variables are not configured",
      }
    }

    console.log("Creating profiles for user:", userId)

    // Use admin client to bypass RLS policies
    const supabase = createAdminClient()

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected if profile doesn't exist
      console.error("Error checking for existing profile:", profileCheckError)
      return { success: false, error: profileCheckError.message }
    }

    if (existingProfile) {
      console.log("Profile already exists, checking student profile")

      // Check if student profile exists
      const { data: existingStudentProfile, error: studentProfileCheckError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (studentProfileCheckError && studentProfileCheckError.code !== "PGRST116") {
        console.error("Error checking for existing student profile:", studentProfileCheckError)
        return { success: false, error: studentProfileCheckError.message }
      }

      if (existingStudentProfile) {
        console.log("Student profile already exists")
        return { success: true, message: "Profiles already exist" }
      }

      console.log("Creating student profile for existing user")
      // Create student profile if it doesn't exist
      const { error: studentProfileError } = await supabase.from("student_profiles").insert({
        id: userId,
        age_group: ageGroup as any,
        education_level: "school",
        parent_email: parentEmail,
        parent_verified: false,
        onboarding_completed: false,
      })

      if (studentProfileError) {
        console.error("Student profile creation error:", studentProfileError)
        return { success: false, error: studentProfileError.message }
      }

      return { success: true }
    }

    console.log("Creating new profile and student profile")

    // Try to create both profiles with retries
    let retries = 3
    let profileCreated = false
    let error = null

    while (retries > 0 && !profileCreated) {
      try {
        // 1. Create the profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          role: "student",
          first_name: firstName,
          last_name: lastName,
        })

        if (profileError) {
          console.error(`Profile creation error (attempt ${4 - retries}/3):`, profileError)
          error = profileError
          retries--

          // Wait a bit longer between retries
          await new Promise((resolve) => setTimeout(resolve, 1000))
          continue
        }

        // 2. Create the student profile
        const { error: studentProfileError } = await supabase.from("student_profiles").insert({
          id: userId,
          age_group: ageGroup as any,
          education_level: "school", // Default value, will be updated during onboarding
          parent_email: parentEmail,
          parent_verified: false,
          onboarding_completed: false,
        })

        if (studentProfileError) {
          console.error("Student profile creation error:", studentProfileError)

          // If student profile creation fails, try to delete the main profile to maintain consistency
          await supabase.from("profiles").delete().eq("id", userId)

          error = studentProfileError
          retries--

          // Wait a bit longer between retries
          await new Promise((resolve) => setTimeout(resolve, 1000))
          continue
        }

        // If we get here, both profiles were created successfully
        profileCreated = true
        console.log("Successfully created profiles for user:", userId)
      } catch (e) {
        console.error(`Unexpected error during profile creation (attempt ${4 - retries}/3):`, e)
        error = e
        retries--

        // Wait a bit longer between retries
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!profileCreated) {
      return {
        success: false,
        error: error?.message || "Failed to create profiles after multiple attempts",
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Server action error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function sendParentApprovalEmail(
  userId: string,
  firstName: string,
  lastName: string,
  parentEmail: string,
) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Supabase environment variables are not configured",
      }
    }

    console.log("Sending parent approval email for user:", userId)

    // Use admin client to bypass RLS policies
    const supabase = createAdminClient()

    // Generate a secure token for the approval link
    const approvalToken = crypto.randomUUID()

    // Store the token in the database
    const { error: tokenError } = await supabase.from("parent_approval_tokens").insert({
      user_id: userId,
      token: approvalToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })

    if (tokenError) {
      console.error("Error storing approval token:", tokenError)
      return { success: false, error: tokenError.message }
    }

    // Create the approval URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const approvalUrl = `${appUrl}/parent-approval?token=${approvalToken}`

    // Send the email using Supabase's email service
    // Note: In a real implementation, you might want to use a dedicated email service
    // This is a simplified version that assumes Supabase can send custom emails

    // For now, we'll use a workaround by creating a temporary user and sending a password reset
    // In a production environment, you would use a proper email service
    const tempUserEmail = `parent-approval-${Date.now()}@example.com`

    const { data: tempUser, error: tempUserError } = await supabase.auth.admin.createUser({
      email: tempUserEmail,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: {
        type: "parent_approval",
        child_name: `${firstName} ${lastName}`,
        child_id: userId,
        approval_url: approvalUrl,
      },
    })

    if (tempUserError) {
      console.error("Error creating temporary user for email:", tempUserError)
      return { success: false, error: tempUserError.message }
    }

    // Store the relationship between the parent email and the child user
    const { error: relationError } = await supabase
      .from("parent_child_relations")
      .insert({
        parent_email: parentEmail,
        child_id: userId,
        child_name: `${firstName} ${lastName}`,
        approval_token: approvalToken,
      })
      .select()

    if (relationError) {
      console.error("Error storing parent-child relation:", relationError)
      // Continue anyway, this is not critical
    }

    // In a real implementation, you would send an email to the parent with the approval link
    console.log(`Parent approval email would be sent to ${parentEmail} with approval URL: ${approvalUrl}`)

    // For development purposes, log the approval URL
    console.log(`Development: Parent approval URL: ${approvalUrl}`)

    return { success: true }
  } catch (error: any) {
    console.error("Error sending parent approval email:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function verifyParentApproval(token: string) {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: "Supabase environment variables are not configured",
      }
    }

    console.log("Verifying parent approval token:", token)

    // Use admin client to bypass RLS policies
    const supabase = createAdminClient()

    // Find the token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from("parent_approval_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      console.error("Error finding approval token:", tokenError)
      return { success: false, error: "Invalid or expired approval token." }
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return { success: false, error: "Approval token has expired. Please request a new one." }
    }

    // Check if token has already been used
    if (tokenData.used_at) {
      return { success: false, error: "This approval has already been processed." }
    }

    // Get the user's profile to get their name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", tokenData.user_id)
      .single()

    if (profileError || !profile) {
      console.error("Error finding user profile:", profileError)
      return { success: false, error: "Could not find the associated user profile." }
    }

    // Mark the token as used
    const { error: updateTokenError } = await supabase
      .from("parent_approval_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token)

    if (updateTokenError) {
      console.error("Error updating token:", updateTokenError)
      return { success: false, error: "Failed to process approval." }
    }

    // Update the student profile to mark parent verification as complete
    const { error: updateProfileError } = await supabase
      .from("student_profiles")
      .update({ parent_verified: true })
      .eq("id", tokenData.user_id)

    if (updateProfileError) {
      console.error("Error updating student profile:", updateProfileError)
      return { success: false, error: "Failed to update student profile." }
    }

    // Return success with the child's name
    const childName = `${profile.first_name} ${profile.last_name}`
    return {
      success: true,
      message: `You have successfully approved ${childName}'s PathPiper account.`,
      childName,
    }
  } catch (error: any) {
    console.error("Error verifying parent approval:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
