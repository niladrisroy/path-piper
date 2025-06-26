
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if keys are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure redirect URLs to use production domain
    redirectTo: 'https://pathpiper.replit.app/auth/callback',
    // Disable automatic redirect detection
    detectSessionInUrl: true,
    // Set session persistence
    persistSession: true,
    // Configure flow type
    flowType: 'pkce'
  }
})
