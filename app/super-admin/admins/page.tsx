'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Building2, Mail, Phone, MoreVertical } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface CoachingAdmin {
  id: string
  email: string
  institute_id: string
  is_active: boolean
  created_at: string
  institutes: {
    name: string
  }
}

export default function CoachingAdminsPage() {
  const [admins, setAdmins] = useState<CoachingAdmin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoachingAdmins()
  }, [])

  const fetchCoachingAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          institute_id,
          is_active,
          created_at,
          institutes (
            name
          )
        `)
        .eq('role', 'coaching_admin')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching coaching admins:', error)
      } else {
        // Map the data - handle institutes as array or single object
        const adminsData = data?.map(admin => ({
          ...admin,
          institutes: Array.isArray(admin.institutes) ? admin.institutes[0] : admin.institutes || { name: 'No Institute' }
        })) || []
        setAdmins(adminsData as CoachingAdmin[])
      }
    } catch (error) {
      console.error('Error fetching coaching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaching Admins</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage coaching administrators for each institute
          </p>
        </div>
        <Link href="/super-admin/admins/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Link>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No coaching admins found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new coaching admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{admin.email}</h3>
                    <p className="text-sm text-gray-500">{admin.institutes?.name || 'No Institute'}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Building2 className="h-4 w-4 mr-1" />
                      <span>Institute Admin</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Created: {formatDate(admin.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/super-admin/admins/${admin.id}`}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/super-admin/admins/${admin.id}/edit`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
