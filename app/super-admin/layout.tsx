'use client'

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth-optimized'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (user.role !== 'super_admin') {
        router.push('/')
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

  if (!user || user.role !== 'super_admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminSidebar />
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
