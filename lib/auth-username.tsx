'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

interface User {
  id: string
  username: string
  role: 'super_admin' | 'coaching_admin' | 'student'
  institute_id: string | null
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string) => {
    try {
      // For now, we'll use a simple approach
      // In production, you'd hash the password and compare with password_hash
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { success: false, error: 'Invalid username or password' }
      }

      // Simple password check (in production, use proper password hashing)
      if (data.password_hash !== password) {
        return { success: false, error: 'Invalid username or password' }
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        role: data.role,
        institute_id: data.institute_id,
        is_active: data.is_active
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An error occurred during sign in' }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
