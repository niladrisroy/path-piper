import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient, createServerActionSupabaseClient } from "./server"
import type { UserRole } from "@/types/database"

// Client-side auth functions
export const signUp = async (email: string, password: string, role: UserRole) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  })

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export const signInWithGoogle = async () => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

export const signInWithMicrosoft = async () => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

export const signInWithApple = async () => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

export const signOut = async () => {
  const supabase = createClientSideSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  return { data, error }
}

export const updatePassword = async (newPassword: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

// Server-side auth functions
export const getCurrentUser = async () => {
  const supabase = createServerSideSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return { user: session.user, profile }
}

export const getUserRole = async (userId: string) => {
  const supabase = createServerSideSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (error || !data) {
    return null
  }

  return data.role as UserRole
}

// Server action for auth
export const serverSignOut = async () => {
  "use server"
  const supabase = createServerActionSupabaseClient()
  await supabase.auth.signOut()
}
