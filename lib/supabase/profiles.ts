import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient, createServerActionSupabaseClient } from "./server"
import type { Profile, StudentProfile } from "@/types/database"

// Client-side profile functions
export const createProfile = async (profile: Omit<Profile, "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("profiles").insert(profile).select().single()

  return { data, error }
}

export const updateProfile = async (id: string, updates: Partial<Profile>) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const getProfile = async (id: string) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  return { data, error }
}

// Student profile functions
export const createStudentProfile = async (profile: Omit<StudentProfile, "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("student_profiles").insert(profile).select().single()

  return { data, error }
}

export const updateStudentProfile = async (id: string, updates: Partial<StudentProfile>) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("student_profiles").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const getStudentProfile = async (id: string) => {
  const supabase = createClientSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("student_profiles").select("*").eq("id", id).single()

  return { data, error }
}

// Server-side profile functions
export const getProfileByIdServer = async (id: string) => {
  const supabase = createServerSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  return { data, error }
}

export const getCompleteStudentProfile = async (id: string) => {
  const supabase = createServerSideSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  // Get base profile
  const { data: baseProfile, error: baseError } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (baseError || !baseProfile) {
    return { data: null, error: baseError }
  }

  // Get student profile
  const { data: studentProfile, error: studentError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (studentError) {
    return { data: null, error: studentError }
  }

  return {
    data: {
      ...baseProfile,
      studentProfile,
    },
    error: null,
  }
}

// Server actions for profiles
export const serverUpdateProfile = async (id: string, updates: Partial<Profile>) => {
  "use server"
  const supabase = createServerActionSupabaseClient()
  if (!supabase) return { data: null, error: new Error("Supabase client not available") }

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select().single()

  return { data, error }
}
