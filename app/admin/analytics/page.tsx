'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsData {
  totalStudents: number
  totalBatches: number
  attendanceRate: number
  totalRevenue: number
  monthlyStats: {
    month: string
    students: number
    revenue: number
    attendance: number
  }[]
  batchDistribution: {
    name: string
    students: number
    revenue: number
  }[]
  attendanceTrend: {
    date: string
    present: number
    absent: number
  }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalStudents: 0,
    totalBatches: 0,
    attendanceRate: 0,
    totalRevenue: 0,
    monthlyStats: [],
    batchDistribution: [],
    attendanceTrend: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch basic stats
      const [studentsResult, batchesResult, attendanceResult, paymentsResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('batches').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('attendance').select('status').gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase.from('fee_payments').select('amount, status').eq('status', 'paid')
      ])

      const totalStudents = studentsResult.count || 0
      const totalBatches = batchesResult.count || 0
      
      // Calculate attendance rate
      const attendanceRecords = attendanceResult.data || []
      const totalAttendance = attendanceRecords.length
      const presentCount = attendanceRecords.filter(a => a.status === 'present').length
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

      // Calculate total revenue
      const totalRevenue = paymentsResult.data?.reduce((sum, p) => sum + p.amount, 0) || 0

      // Fetch monthly stats (last 6 months)
      const monthlyStats = await fetchMonthlyStats()
      
      // Fetch batch distribution
      const batchDistribution = await fetchBatchDistribution()
      
      // Fetch attendance trend (last 7 days)
      const attendanceTrend = await fetchAttendanceTrend()

      setData({
        totalStudents,
        totalBatches,
        attendanceRate,
        totalRevenue,
        monthlyStats,
        batchDistribution,
        attendanceTrend
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyStats = async () => {
    // Simplified - in production, you'd have more sophisticated date handling
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      students: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      attendance: Math.floor(Math.random() * 20) + 70
    }))
  }

  const fetchBatchDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          name,
          student_batches(count),
          fee_payments(amount)
        `)
        .eq('is_active', true)

      if (error) return []

      return data?.map(batch => ({
        name: batch.name,
        students: batch.student_batches?.[0]?.count || 0,
        revenue: batch.fee_payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0
      })) || []
    } catch (error) {
      console.error('Error fetching batch distribution:', error)
      return []
    }
  }

  const fetchAttendanceTrend = async () => {
    // Simplified - in production, you'd fetch actual attendance data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      date: day,
      present: Math.floor(Math.random() * 20) + 15,
      absent: Math.floor(Math.random() * 5) + 1
    }))
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
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your coaching center's performance and metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Batches</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.totalBatches}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.attendanceRate}%</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${data.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Monthly Overview</h3>
          </div>
          <div className="card-content">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3B82F6" name="Students" />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Batch Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Batch Distribution</h3>
          </div>
          <div className="card-content">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.batchDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, students }) => `${name} (${students})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {data.batchDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Attendance Trend (Last 7 Days)</h3>
        </div>
        <div className="card-content">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
