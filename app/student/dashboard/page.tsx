'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Calendar, DollarSign, TrendingUp, AlertCircle, User, FileText } from 'lucide-react'
import { formatDate, formatCurrency, calculateAttendancePercentage } from '@/lib/utils'

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

export default function StudentDashboard() {
  const { user } = useAuth()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    present: 0,
    total: 0,
    percentage: 0,
  })
  const [feeData, setFeeData] = useState<FeeData>({
    paid: 0,
    pending: 0,
    overdue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStudentData()
    }
  }, [user])

  const fetchStudentData = async () => {
    try {
      // Fetch student profile
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (studentError) {
        console.error('Error fetching student data:', studentError)
        return
      }

      setStudentData(student)

      // Fetch attendance data for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', student.id)
        .gte('date', thirtyDaysAgo)

      if (!attendanceError && attendance) {
        const present = attendance.filter(a => a.status === 'present').length
        const total = attendance.length
        const percentage = calculateAttendancePercentage(present, total)
        setAttendanceData({ present, total, percentage })
      }

      // Fetch fee data
      const { data: fees, error: feeError } = await supabase
        .from('fee_payments')
        .select('status, amount')
        .eq('student_id', student.id)

      if (!feeError && fees) {
        const paid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
        const pending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0)
        const overdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0)
        setFeeData({ paid, pending, overdue })
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
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

  if (!studentData) {
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

  const statCards = [
    {
      name: 'Attendance %',
      value: `${attendanceData.percentage}%`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: `${attendanceData.present} of ${attendanceData.total} days`,
    },
    {
      name: 'Fees Paid',
      value: formatCurrency(feeData.paid),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: 'Total paid amount',
    },
    {
      name: 'Pending Fees',
      value: formatCurrency(feeData.pending),
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      subtitle: 'Amount pending',
    },
    {
      name: 'Overdue Fees',
      value: formatCurrency(feeData.overdue),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subtitle: 'Amount overdue',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {studentData.first_name}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your academic progress and account status
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
                    <dd className="text-xs text-gray-500">
                      {stat.subtitle}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
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
                <dd className="text-sm text-gray-900">{studentData.student_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="text-sm text-gray-900">{studentData.first_name} {studentData.last_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{studentData.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{studentData.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent/Guardian</dt>
                <dd className="text-sm text-gray-900">{studentData.parent_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Phone</dt>
                <dd className="text-sm text-gray-900">{studentData.parent_phone}</dd>
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
                  <span className="text-sm font-medium">Update Profile</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
