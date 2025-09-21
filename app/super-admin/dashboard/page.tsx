'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Users, GraduationCap, DollarSign, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'

interface DashboardStats {
  totalInstitutes: number
  activeInstitutes: number
  totalCoachingAdmins: number
  totalStudents: number
  totalRevenue: number
  recentActivity: number
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInstitutes: 0,
    activeInstitutes: 0,
    totalCoachingAdmins: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch total institutes
      const { count: institutesCount } = await supabase
        .from('institutes')
        .select('*', { count: 'exact', head: true })

      // Fetch active institutes
      const { count: activeInstitutesCount } = await supabase
        .from('institutes')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')

      // Fetch total coaching admins
      const { count: adminsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'coaching_admin')

      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      // Fetch total revenue (simplified)
      const { data: revenueData } = await supabase
        .from('fee_payments')
        .select('amount')
        .eq('status', 'paid')

      const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Fetch recent activity (notifications)
      const { count: activityCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      setStats({
        totalInstitutes: institutesCount || 0,
        activeInstitutes: activeInstitutesCount || 0,
        totalCoachingAdmins: adminsCount || 0,
        totalStudents: studentsCount || 0,
        totalRevenue,
        recentActivity: activityCount || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Institutes',
      value: stats.totalInstitutes,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Institutes',
      value: stats.activeInstitutes,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Coaching Admins',
      value: stats.totalCoachingAdmins,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Recent Activity',
      value: stats.recentActivity,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all coaching institutes and system statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Create New Institute</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Add Coaching Admin</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">View Analytics</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">System Online</p>
                  <p className="text-gray-500">All services operational</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Database Connected</p>
                  <p className="text-gray-500">PostgreSQL running</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Maintenance Mode</p>
                  <p className="text-gray-500">Scheduled for tonight</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
