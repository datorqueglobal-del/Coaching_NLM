'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Edit, Trash2, Users, Building2, Mail, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface CoachingAdmin {
  id: string
  email: string
  role: string
  institute_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  institutes: {
    id: string
    name: string
    contact_person: string
    contact_email: string
    contact_phone: string
    address: string
    subscription_status: string
    subscription_plan: string
    max_students: number
  } | null
}

interface AdminStats {
  totalStudents: number
  totalBatches: number
  monthlyRevenue: number
  lastLogin: string | null
}

export default function AdminDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [admin, setAdmin] = useState<CoachingAdmin | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalBatches: 0,
    monthlyRevenue: 0,
    lastLogin: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAdminDetails()
      fetchAdminStats()
    }
  }, [params.id])

  const fetchAdminDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          institute_id,
          is_active,
          created_at,
          updated_at,
          institutes (
            id,
            name,
            contact_person,
            contact_email,
            contact_phone,
            address,
            subscription_status,
            subscription_plan,
            max_students
          )
        `)
        .eq('id', params.id)
        .eq('role', 'coaching_admin')
        .single()

      if (error) {
        console.error('Error fetching admin:', error)
      } else {
        setAdmin({
          ...data,
          institutes: Array.isArray(data.institutes) ? data.institutes[0] : data.institutes || null
        })
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminStats = async () => {
    try {
      // Fetch total students for this admin's institute
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', admin?.institute_id)
        .eq('is_active', true)

      // Fetch total batches for this admin's institute
      const { count: batchesCount } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', admin?.institute_id)
        .eq('is_active', true)

      // Fetch monthly revenue for this admin's institute
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: revenueData } = await supabase
        .from('fee_payments')
        .select('amount')
        .eq('institute_id', admin?.institute_id)
        .eq('status', 'paid')
        .gte('paid_date', `${currentMonth}-01`)

      const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      setStats({
        totalStudents: studentsCount || 0,
        totalBatches: batchesCount || 0,
        monthlyRevenue,
        lastLogin: null // This would need to be tracked separately
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  if (!admin) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Admin not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The coaching admin you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link href="/super-admin/admins" className="btn btn-primary">
            Back to Admins
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/super-admin/admins"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{admin.email}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Coaching Admin Details & Management
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/super-admin/admins/${admin.id}/edit`}
            className="btn btn-secondary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button className="btn btn-danger">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalStudents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Batches
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalBatches}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Status
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Admin Information</h3>
          </div>
          <div className="card-content">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{admin.role.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(admin.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(admin.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Institute Information</h3>
          </div>
          <div className="card-content">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Institute Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.institutes?.name || 'No Institute'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.institutes?.contact_person || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.institutes?.contact_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.institutes?.contact_phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Subscription Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.institutes?.subscription_status || '')}`}>
                    {admin.institutes?.subscription_status || 'N/A'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Max Students</dt>
                <dd className="mt-1 text-sm text-gray-900">{admin.institutes?.max_students || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
