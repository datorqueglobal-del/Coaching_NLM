'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalBatches: number
  attendancePercentage: number
  feeDefaulters: number
  recentNotifications: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalBatches: 0,
    attendancePercentage: 0,
    feeDefaulters: 0,
    recentNotifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch total batches
      const { count: batchesCount } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Fetch fee defaulters
      const { count: defaultersCount } = await supabase
        .from('fee_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue')

      // Fetch recent notifications
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_sent', false)

      // Calculate attendance percentage (simplified)
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      const totalAttendance = attendanceData?.length || 0
      const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0
      const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

      setStats({
        totalStudents: studentsCount || 0,
        totalBatches: batchesCount || 0,
        attendancePercentage,
        feeDefaulters: defaultersCount || 0,
        recentNotifications: notificationsCount || 0,
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
      value: stats.totalBatches,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Attendance %',
      value: `${stats.attendancePercentage}%`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Fee Defaulters',
      value: stats.feeDefaulters,
      icon: DollarSign,
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your coaching management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span className="text-sm font-medium">Process Fee Payment</span>
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
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">New student enrolled</p>
                  <p className="text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Fee payment overdue</p>
                  <p className="text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-gray-900">Attendance marked for Batch A</p>
                  <p className="text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
