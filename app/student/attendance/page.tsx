'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate, calculateAttendancePercentage } from '@/lib/utils'

interface AttendanceRecord {
  id: string
  date: string
  status: 'present' | 'absent' | 'late'
  remarks?: string
  batches: {
    name: string
  }
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  percentage: number
}

export default function StudentAttendancePage() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchAttendanceData()
    }
  }, [user, selectedBatch])

  const fetchAttendanceData = async () => {
    try {
      // First get student ID
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (studentError || !student) {
        console.error('Error fetching student:', studentError)
        return
      }

      // Build query
      let query = supabase
        .from('attendance')
        .select(`
          *,
          batches (
            name
          )
        `)
        .eq('student_id', student.id)
        .order('date', { ascending: false })

      // Filter by batch if selected
      if (selectedBatch !== 'all') {
        query = query.eq('batch_id', selectedBatch)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching attendance:', error)
        return
      }

      setAttendanceRecords(data || [])

      // Calculate stats
      const total = data?.length || 0
      const present = data?.filter(r => r.status === 'present').length || 0
      const absent = data?.filter(r => r.status === 'absent').length || 0
      const late = data?.filter(r => r.status === 'late').length || 0
      const percentage = calculateAttendancePercentage(present, total)

      setStats({ total, present, absent, late, percentage })
    } catch (error) {
      console.error('Error fetching attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Record</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your attendance history and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Days</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.present}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.absent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Percentage</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.percentage}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Attendance History</h3>
        </div>
        <div className="card-content">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your attendance will appear here once it's marked by your teacher.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(record.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.batches.name}
                      </p>
                      {record.remarks && (
                        <p className="text-xs text-gray-400 mt-1">
                          {record.remarks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                    {getStatusIcon(record.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
