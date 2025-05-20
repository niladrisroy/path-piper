import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase-types"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server components
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create a Supabase client for server-side operations
export function createServerSideSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create a Supabase client for server actions
export function createServerActionSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create a generic server client
export function createServerClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create a Supabase admin client with the service role key
export function createAdminClient() {
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
