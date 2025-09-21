'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Plus, Users, DollarSign, Calendar, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Institute {
  id: string
  name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  address: string
  subscription_status: 'active' | 'suspended' | 'expired' | 'trial'
  subscription_plan: string
  max_students: number
  created_at: string
}

export default function InstitutesPage() {
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstitutes()
  }, [])

  const fetchInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching institutes:', error)
      } else {
        setInstitutes(data || [])
      }
    } catch (error) {
      console.error('Error fetching institutes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Institutes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all coaching institutes in the system
          </p>
        </div>
        <Link href="/super-admin/institutes/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Institute
        </Link>
      </div>

      {institutes.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No institutes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new institute.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutes.map((institute) => (
            <div key={institute.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{institute.name}</h3>
                    <p className="text-sm text-gray-500">{institute.contact_person}</p>
                    <p className="text-sm text-gray-500">{institute.contact_email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(institute.subscription_status)}`}>
                      {institute.subscription_status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Max Students: {institute.max_students}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Plan: {institute.subscription_plan}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Created: {formatDate(institute.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/super-admin/institutes/${institute.id}`}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/super-admin/institutes/${institute.id}/edit`}
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
