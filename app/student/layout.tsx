'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import StudentSidebar from '@/components/student/StudentSidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (userRole !== 'student') {
        router.push('/')
      }
    }
  }, [user, userRole, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || userRole !== 'student') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
