import { createClientSideSupabaseClient } from "./client"
import { createServerSideSupabaseClient } from "./server"
import type { MentorExpertise, MentorExperience, MentorAvailability, Mentorship } from "@/types/database"

// Mentor expertise functions
export const getMentorExpertise = async (mentorId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_expertise").select("*").eq("mentor_id", mentorId).order("subject")

  return { data, error }
}

export const addMentorExpertise = async (expertise: Omit<MentorExpertise, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_expertise").insert(expertise).select().single()

  return { data, error }
}

export const updateMentorExpertise = async (id: string, updates: Partial<MentorExpertise>) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_expertise").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const removeMentorExpertise = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("mentor_expertise").delete().eq("id", id)

  return { error }
}

// Mentor experience functions
export const getMentorExperience = async (mentorId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("mentor_experience")
    .select("*")
    .eq("mentor_id", mentorId)
    .order("start_date", { ascending: false })

  return { data, error }
}

export const addMentorExperience = async (experience: Omit<MentorExperience, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_experience").insert(experience).select().single()

  return { data, error }
}

export const updateMentorExperience = async (id: string, updates: Partial<MentorExperience>) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_experience").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const removeMentorExperience = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("mentor_experience").delete().eq("id", id)

  return { error }
}

// Mentor availability functions
export const getMentorAvailability = async (mentorId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_availability").select("*").eq("mentor_id", mentorId)

  return { data, error }
}

export const addMentorAvailability = async (availability: Omit<MentorAvailability, "id" | "created_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentor_availability").insert(availability).select().single()

  return { data, error }
}

export const removeMentorAvailability = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("mentor_availability").delete().eq("id", id)

  return { error }
}

// Mentorship functions
export const getMentorships = async (userId: string, role: "mentor" | "student") => {
  const supabase = createClientSideSupabaseClient()

  const field = role === "mentor" ? "mentor_id" : "student_id"

  const { data, error } = await supabase
    .from("mentorships")
    .select(`
      *,
      mentor:mentor_profiles!mentorships_mentor_id_fkey(
        id,
        profiles!mentor_profiles_id_fkey(
          id,
          first_name,
          last_name,
          profile_image_url
        )
      ),
      student:student_profiles!mentorships_student_id_fkey(
        id,
        profiles!student_profiles_id_fkey(
          id,
          first_name,
          last_name,
          profile_image_url
        )
      )
    `)
    .eq(field, userId)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const createMentorship = async (mentorship: Omit<Mentorship, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentorships").insert(mentorship).select().single()

  return { data, error }
}

export const updateMentorshipStatus = async (id: string, status: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("mentorships").update({ status }).eq("id", id).select().single()

  return { data, error }
}

// Server-side functions
export const getMentorshipsServer = async (userId: string, role: "mentor" | "student") => {
  const supabase = createServerSideSupabaseClient()

  const field = role === "mentor" ? "mentor_id" : "student_id"

  const { data, error } = await supabase
    .from("mentorships")
    .select(`
      *,
      mentor:mentor_profiles!mentorships_mentor_id_fkey(
        id,
        profiles!mentor_profiles_id_fkey(
          id,
          first_name,
          last_name,
          profile_image_url
        )
      ),
      student:student_profiles!mentorships_student_id_fkey(
        id,
        profiles!student_profiles_id_fkey(
          id,
          first_name,
          last_name,
          profile_image_url
        )
      )
    `)
    .eq(field, userId)
    .order("created_at", { ascending: false })

  return { data, error }
}
