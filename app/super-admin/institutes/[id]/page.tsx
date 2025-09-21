'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Building2, ArrowLeft, Edit, Trash2, Users, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Institute {
  id: string
  name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  address: string
  logo_url?: string
  subscription_status: 'active' | 'suspended' | 'expired' | 'trial'
  subscription_plan: string
  max_students: number
  created_at: string
  updated_at: string
}

interface InstituteStats {
  totalStudents: number
  totalBatches: number
  totalCoachingAdmins: number
  monthlyRevenue: number
}

export default function InstituteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [stats, setStats] = useState<InstituteStats>({
    totalStudents: 0,
    totalBatches: 0,
    totalCoachingAdmins: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchInstituteDetails()
      fetchInstituteStats()
    }
  }, [params.id])

  const fetchInstituteDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching institute:', error)
      } else {
        setInstitute(data)
      }
    } catch (error) {
      console.error('Error fetching institute:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInstituteStats = async () => {
    try {
      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', params.id)
        .eq('is_active', true)

      // Fetch total batches
      const { count: batchesCount } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', params.id)
        .eq('is_active', true)

      // Fetch total coaching admins
      const { count: adminsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', params.id)
        .eq('role', 'coaching_admin')
        .eq('is_active', true)

      // Fetch monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: revenueData } = await supabase
        .from('fee_payments')
        .select('amount')
        .eq('institute_id', params.id)
        .eq('status', 'paid')
        .gte('paid_date', `${currentMonth}-01`)

      const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      setStats({
        totalStudents: studentsCount || 0,
        totalBatches: batchesCount || 0,
        totalCoachingAdmins: adminsCount || 0,
        monthlyRevenue
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

  if (!institute) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Institute not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The institute you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link href="/super-admin/institutes" className="btn btn-primary">
            Back to Institutes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/super-admin/institutes"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{institute.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Institute Details & Management
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/super-admin/institutes/${institute.id}/edit`}
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
                <Calendar className="h-6 w-6 text-green-600" />
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
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Coaching Admins
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalCoachingAdmins}
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
                <DollarSign className="h-6 w-6 text-yellow-600" />
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
      </div>

      {/* Institute Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Institute Information</h3>
          </div>
          <div className="card-content">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Institute Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.contact_person}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.contact_email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.contact_phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
          </div>
          <div className="card-content">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(institute.subscription_status)}`}>
                    {institute.subscription_status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{institute.subscription_plan}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Max Students</dt>
                <dd className="mt-1 text-sm text-gray-900">{institute.max_students}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(institute.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(institute.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
