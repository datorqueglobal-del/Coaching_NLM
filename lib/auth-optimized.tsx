'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from './supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  role: 'super_admin' | 'coaching_admin' | 'student'
  institute_id: string | null
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  userRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
})

// Cache for user data to avoid repeated API calls
let userCache: { [key: string]: { user: User; timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = useCallback(async (userId: string) => {
    // Check cache first
    const cached = userCache[userId]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUser(cached.user)
      setUserRole(cached.user.role)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, institute_id, is_active, email')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setUserRole('student')
        setLoading(false)
        return
      }

      const userData = {
        id: userId,
        email: data.email,
        role: data.role,
        institute_id: data.institute_id,
        is_active: data.is_active
      }

      // Cache the user data
      userCache[userId] = {
        user: userData,
        timestamp: Date.now()
      }

      setUser(userData)
      setUserRole(data.role)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('student')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          if (session?.user) {
            await fetchUserRole(session.user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Auth initialization error:', error)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserRole])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await fetchUserRole(data.user.id)
        return { success: true }
      }

      return { success: false, error: 'No user data returned' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [fetchUserRole])

  const signOut = useCallback(async () => {
    try {
      // Clear cache
      userCache = {}
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [])

  const contextValue = useMemo(() => ({
    user,
    userRole,
    loading,
    signIn,
    signOut,
  }), [user, userRole, loading, signIn, signOut])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
