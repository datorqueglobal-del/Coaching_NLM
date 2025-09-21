import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tzjmxxhhvkptahmollzh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTY5NDQsImV4cCI6MjA3NDAzMjk0NH0.Qd56LmddBmb1vqErSNos2yDYFqtbnCJrK5TfHpzzqyY'

// Global check to prevent multiple instances
declare global {
  var __supabase_client: SupabaseClient | undefined
  var __supabase_admin_client: SupabaseClient | undefined
}

// Singleton pattern with global check for SSR compatibility
export const supabase = (() => {
  if (typeof window !== 'undefined') {
    // Client-side: use global variable
    if (!global.__supabase_client) {
      global.__supabase_client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        }
      })
    }
    return global.__supabase_client
  } else {
    // Server-side: create new instance
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }
})()

// For server-side operations that require service role
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    // Client-side: use global variable
    if (!global.__supabase_admin_client) {
      global.__supabase_admin_client = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1Njk0NCwiZXhwIjoyMDc0MDMyOTQ0fQ.GKrh1nSPTawX9q29NwREG_mtIp39DgOJ2w9vQE9cbZY',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }
    return global.__supabase_admin_client
  } else {
    // Server-side: create new instance
    return createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1Njk0NCwiZXhwIjoyMDc0MDMyOTQ0fQ.GKrh1nSPTawX9q29NwREG_mtIp39DgOJ2w9vQE9cbZY',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
})()
