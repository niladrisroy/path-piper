import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient } from "./server"
import type { Skill, Interest } from "@/types/database"

// Skills functions
export const getSkills = async (category?: string) => {
  const supabase = createClientSideSupabaseClient()

  let query = supabase.from("skills").select("*")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("name")

  return { data, error }
}

export const getUserSkills = async (userId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("user_skills")
    .select(`
      *,
      skill:skills(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const addUserSkill = async (userId: string, skillId: string, proficiencyLevel: number) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("user_skills")
    .insert({
      user_id: userId,
      skill_id: skillId,
      proficiency_level: proficiencyLevel,
    })
    .select()
    .single()

  return { data, error }
}

export const updateUserSkill = async (id: string, proficiencyLevel: number) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("user_skills")
    .update({ proficiency_level: proficiencyLevel })
    .eq("id", id)
    .select()
    .single()

  return { data, error }
}

export const removeUserSkill = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("user_skills").delete().eq("id", id)

  return { error }
}

export const createSkill = async (skill: Omit<Skill, "id" | "created_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("skills").insert(skill).select().single()

  return { data, error }
}

// Interests functions
export const getInterests = async (category?: string) => {
  const supabase = createClientSideSupabaseClient()

  let query = supabase.from("interests").select("*")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("name")

  return { data, error }
}

export const getUserInterests = async (userId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("user_interests")
    .select(`
      *,
      interest:interests(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const addUserInterest = async (userId: string, interestId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("user_interests")
    .insert({
      user_id: userId,
      interest_id: interestId,
    })
    .select()
    .single()

  return { data, error }
}

export const removeUserInterest = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("user_interests").delete().eq("id", id)

  return { error }
}

export const createInterest = async (interest: Omit<Interest, "id" | "created_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("interests").insert(interest).select().single()

  return { data, error }
}

// Server-side functions
export const getSkillsServer = async (category?: string) => {
  const supabase = createServerSideSupabaseClient()

  let query = supabase.from("skills").select("*")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("name")

  return { data, error }
}

export const getInterestsServer = async (category?: string) => {
  const supabase = createServerSideSupabaseClient()

  let query = supabase.from("interests").select("*")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.order("name")

  return { data, error }
}
