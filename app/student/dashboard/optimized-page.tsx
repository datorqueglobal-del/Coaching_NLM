'use client'

export const dynamic = 'force-dynamic'

import { useAuth } from '@/lib/auth-optimized'
import { useSupabaseQuery } from '@/lib/hooks/useOptimizedData'
import { Calendar, DollarSign, AlertCircle, User, FileText } from 'lucide-react'
import { formatDate, formatCurrency, calculateAttendancePercentage } from '@/lib/utils'
import OptimizedLoadingSpinner from '@/components/ui/OptimizedLoadingSpinner'
import { memo } from 'react'

interface StudentData {
  id: string
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  parent_name: string
  parent_phone: string
  parent_email: string
}

interface AttendanceData {
  present: number
  total: number
  percentage: number
}

interface FeeData {
  paid: number
  pending: number
  overdue: number
}

const StatCard = memo(({ stat }: { stat: any }) => (
  <div className="card">
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
            <dd className="text-xs text-gray-500">
              {stat.subtitle}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
))

StatCard.displayName = 'StatCard'

export default function StudentDashboard() {
  const { user } = useAuth()

  // Fetch student data with caching
  const { data: studentData, loading: studentLoading } = useSupabaseQuery<StudentData[]>(
    'students',
    '*',
    { user_id: user?.id },
    { cacheKey: `student-${user?.id}`, enabled: !!user?.id }
  )

  // Fetch attendance data with caching
  const { data: attendanceData, loading: attendanceLoading } = useSupabaseQuery<any[]>(
    'attendance',
    'status',
    { 
      student_id: studentData?.[0]?.id,
      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    },
    { 
      cacheKey: `attendance-${studentData?.[0]?.id}`, 
      enabled: !!studentData?.[0]?.id 
    }
  )

  // Fetch fee data with caching
  const { data: feeData, loading: feeLoading } = useSupabaseQuery<any[]>(
    'fee_payments',
    'status, amount',
    { student_id: studentData?.[0]?.id },
    { 
      cacheKey: `fees-${studentData?.[0]?.id}`, 
      enabled: !!studentData?.[0]?.id 
    }
  )

  // Calculate stats
  const stats = {
    attendance: {
      present: attendanceData?.filter(a => a.status === 'present').length || 0,
      total: attendanceData?.length || 0,
      percentage: calculateAttendancePercentage(
        attendanceData?.filter(a => a.status === 'present').length || 0,
        attendanceData?.length || 0
      )
    },
    fees: {
      paid: feeData?.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) || 0,
      pending: feeData?.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0) || 0,
      overdue: feeData?.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0) || 0
    }
  }

  const statCards = [
    {
      name: 'Attendance %',
      value: `${stats.attendance.percentage}%`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: `${stats.attendance.present} of ${stats.attendance.total} days`,
    },
    {
      name: 'Fees Paid',
      value: formatCurrency(stats.fees.paid),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: 'Total paid amount',
    },
    {
      name: 'Pending Fees',
      value: formatCurrency(stats.fees.pending),
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      subtitle: 'Amount pending',
    },
    {
      name: 'Overdue Fees',
      value: formatCurrency(stats.fees.overdue),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subtitle: 'Amount overdue',
    },
  ]

  const loading = studentLoading || attendanceLoading || feeLoading

  if (loading) {
    return <OptimizedLoadingSpinner />
  }

  if (!studentData?.[0]) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No student data found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please contact your administrator if this issue persists.
        </p>
      </div>
    )
  }

  const student = studentData[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student.first_name}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your academic progress and account status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          </div>
          <div className="card-content">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                <dd className="text-sm text-gray-900">{student.student_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="text-sm text-gray-900">{student.first_name} {student.last_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{student.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{student.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent/Guardian</dt>
                <dd className="text-sm text-gray-900">{student.parent_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Phone</dt>
                <dd className="text-sm text-gray-900">{student.parent_phone}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">View Attendance</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">View Fee Status</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">Download Receipts</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium">View Profile</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
