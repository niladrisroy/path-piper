import { createServerClient } from "./server"
import { supabaseClient } from "./client"
import type { UserInterest } from "@/types/database"

// Client-side interest functions
export const createUserInterest = async (userInterest: Omit<UserInterest, "id" | "created_at">) => {
  const { data, error } = await supabaseClient.from("user_interests").insert(userInterest).select().single()

  return { data, error }
}

export const deleteUserInterest = async (id: string) => {
  const { error } = await supabaseClient.from("user_interests").delete().eq("id", id)

  return { error }
}

export const getUserInterests = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("user_interests")
    .select(`
      *,
      interest:interest_id(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const getInterests = async (category?: string) => {
  let query = supabaseClient.from("interests").select("*").order("name")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  return { data, error }
}

// Server-side interest functions
export const getUserInterestsServer = async (userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("user_interests")
    .select(`
      *,
      interest:interest_id(*)
    `)
    .eq("user_id", userId)

  return { data, error }
}

export const getInterestsServer = async (category?: string) => {
  const supabase = createServerClient()

  let query = supabase.from("interests").select("*").order("name")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  return { data, error }
}
