import { createServerClient } from "./server"
import { supabaseClient } from "./client"
import type { Goal } from "@/types/database"

// Client-side goal functions
export const createGoal = async (goal: Omit<Goal, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabaseClient.from("goals").insert(goal).select().single()

  return { data, error }
}

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
  const { data, error } = await supabaseClient.from("goals").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const deleteGoal = async (id: string) => {
  const { error } = await supabaseClient.from("goals").delete().eq("id", id)

  return { error }
}

export const getUserGoals = async (userId: string) => {
  const { data, error } = await supabaseClient
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data, error }
}

// Server-side goal functions
export const getUserGoalsServer = async (userId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data, error }
}
