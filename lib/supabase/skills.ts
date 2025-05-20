import { createServerClient } from "./server"
import { supabaseClient } from "./client"
import type { UserSkill } from "@/types/database"

// Client-side skill functions
export const createUserSkill = async (userSkill: Omit<UserSkill, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabaseClient.from("user_skills").insert(userSkill).select().single()

  return { data, error }
}

export const updateUserSkill = async (id: string, updates: Partial<UserSkill>) => {
  const { data, error } = await supabaseClient.from("user_skills").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const deleteUserSkill = async (id: string) => {
  const { error } = await supabaseClient.from("user_skills").delete().eq("id", id)

  return { error }
}

export const getUserSkills = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("user_skills")
    .select(`
      *,
      skill:skill_id(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const getSkills = async (category?: string) => {
  let query = supabaseClient.from("skills").select("*").order("name")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  return { data, error }
}

// Server-side skill functions
export const getUserSkillsServer = async (userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("user_skills")
    .select(`
      *,
      skill:skill_id(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const getSkillsServer = async (category?: string) => {
  const supabase = createServerClient()

  let query = supabase.from("skills").select("*").order("name")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  return { data, error }
}
