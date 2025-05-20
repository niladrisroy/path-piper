"use client"

import type React from "react"

import { createClientSideSupabaseClient } from "./client"
import type { InstitutionProgram, InstitutionEvent, InstitutionGallery } from "@/types/database"
import { createContext, useContext, useState, useEffect } from "react"

// Institution programs functions
export const getInstitutionPrograms = async (institutionId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("institution_programs")
    .select("*")
    .eq("institution_id", institutionId)
    .order("name")

  return { data, error }
}

export const addInstitutionProgram = async (program: Omit<InstitutionProgram, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("institution_programs").insert(program).select().single()

  return { data, error }
}

export const updateInstitutionProgram = async (id: string, updates: Partial<InstitutionProgram>) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("institution_programs").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const removeInstitutionProgram = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("institution_programs").delete().eq("id", id)

  return { error }
}

// Institution events functions
export const getInstitutionEvents = async (institutionId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("institution_events")
    .select("*")
    .eq("institution_id", institutionId)
    .order("start_date", { ascending: true })

  return { data, error }
}

export const addInstitutionEvent = async (event: Omit<InstitutionEvent, "id" | "created_at" | "updated_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("institution_events").insert(event).select().single()

  return { data, error }
}

export const updateInstitutionEvent = async (id: string, updates: Partial<InstitutionEvent>) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("institution_events").update(updates).eq("id", id).select().single()

  return { data, error }
}

export const removeInstitutionEvent = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("institution_events").delete().eq("id", id)

  return { error }
}

// Institution gallery functions
export const getInstitutionGallery = async (institutionId: string) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase
    .from("institution_gallery")
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false })

  return { data, error }
}

export const addInstitutionGalleryImage = async (image: Omit<InstitutionGallery, "id" | "created_at">) => {
  const supabase = createClientSideSupabaseClient()

  const { data, error } = await supabase.from("institution_gallery").insert(image).select().single()

  return { data, error }
}

export const removeInstitutionGalleryImage = async (id: string) => {
  const supabase = createClientSideSupabaseClient()

  const { error } = await supabase.from("institution_gallery").delete().eq("id", id)

  return { error }
}

// Auth context provider
const AuthContext = createContext<any>(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const supabase = createClientSideSupabaseClient()
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()
  }, [])

  const signUp = async (email: string, password: string) => {
    const supabase = createClientSideSupabaseClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = createClientSideSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const supabase = createClientSideSupabaseClient()
    const { error } = await supabase.auth.signOut()
    setUser(null)
    return { error }
  }

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}
