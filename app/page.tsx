'use client'

import { useAuth } from '@/lib/auth-username'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UsernameLoginForm from '@/components/auth/UsernameLoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'super_admin') {
        router.push('/super-admin/dashboard')
      } else if (user.role === 'coaching_admin') {
        router.push('/coaching-admin/dashboard')
      } else if (user.role === 'student') {
        router.push('/student/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Multi-Institute Coaching Management System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in with your username and password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <UsernameLoginForm />
        </div>
      </div>
    </div>
  )
}
