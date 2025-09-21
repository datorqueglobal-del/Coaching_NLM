// Debug utility to check for multiple Supabase instances
export function checkSupabaseInstances() {
  if (typeof window === 'undefined') return

  // Check if there are multiple instances in localStorage
  const supabaseKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('sb-')
  )

  if (supabaseKeys.length > 2) {
    console.warn('Multiple Supabase instances detected in localStorage:', supabaseKeys)
  }

  // Check for multiple GoTrueClient instances
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('auth-token') || key.includes('supabase.auth.token')
  )

  if (authKeys.length > 1) {
    console.warn('Multiple auth tokens detected:', authKeys)
    // Clean up duplicate tokens
    authKeys.slice(1).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

// Run check on module load
if (typeof window !== 'undefined') {
  checkSupabaseInstances()
}
