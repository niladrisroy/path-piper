import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase-types"

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

// Export the supabaseClient directly
export { supabaseClient }

export function getSupabase() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not configured")
    return null
  }

  try {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    return supabaseClient
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    return null
  }
}

export function createClientSideSupabaseClient() {
  return getSupabase()
}
