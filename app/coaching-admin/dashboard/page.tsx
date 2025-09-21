'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-username'
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  activeBatches: number
  todayAttendance: number
  pendingFees: number
  monthlyRevenue: number
  recentActivity: number
}

export default function CoachingAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeBatches: 0,
    todayAttendance: 0,
    pendingFees: 0,
    monthlyRevenue: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.institute_id) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    if (!user?.institute_id) return

    try {
      // Fetch total students for this institute
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', user.institute_id)
        .eq('is_active', true)

      // Fetch active batches for this institute
      const { count: batchesCount } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', user.institute_id)
        .eq('is_active', true)

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', user.institute_id)
        .eq('date', today)

      // Fetch pending fees
      const { count: pendingFeesCount } = await supabase
        .from('fee_payments')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', user.institute_id)
        .eq('status', 'pending')

      // Fetch monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: revenueData } = await supabase
        .from('fee_payments')
        .select('amount')
        .eq('institute_id', user.institute_id)
        .eq('status', 'paid')
        .gte('paid_date', `${currentMonth}-01`)

      const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Fetch recent activity (notifications)
      const { count: activityCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('institute_id', user.institute_id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      setStats({
        totalStudents: studentsCount || 0,
        activeBatches: batchesCount || 0,
        todayAttendance: attendanceCount || 0,
        pendingFees: pendingFeesCount || 0,
        monthlyRevenue,
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
      name: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Batches',
      value: stats.activeBatches,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: "Today's Attendance",
      value: stats.todayAttendance,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Pending Fees',
      value: stats.pendingFees,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
        <h1 className="text-2xl font-bold text-gray-900">Coaching Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your institute's students, batches, and operations
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
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Add New Student</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Create New Batch</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Mark Attendance</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Process Payment</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">New student enrolled</p>
                  <p className="text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Payment received</p>
                  <p className="text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Attendance marked</p>
                  <p className="text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
