'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Student {
  id: string
  first_name: string
  last_name: string
  student_id: string
  batches: {
    id: string
    name: string
  }[]
}

interface AttendanceRecord {
  id: string
  student_id: string
  batch_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  remarks: string | null
  students: {
    first_name: string
    last_name: string
    student_id: string
  } | null
  batches: {
    name: string
  } | null
}

export default function AttendancePage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.institute_id) {
      fetchStudents()
      fetchAttendanceRecords()
    }
  }, [user, selectedDate, selectedBatch])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          student_id,
          student_batches (
            batches (
              id,
              name
            )
          )
        `)
        .eq('institute_id', user?.institute_id)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching students:', error)
      } else {
        const studentsData = data?.map(student => ({
          ...student,
          batches: student.student_batches?.map((sb: any) => sb.batches) || []
        })) || []
        setStudents(studentsData as Student[])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          id,
          student_id,
          batch_id,
          date,
          status,
          remarks,
          students (
            first_name,
            last_name,
            student_id
          ),
          batches (
            name
          )
        `)
        .eq('institute_id', user?.institute_id)
        .eq('date', selectedDate)

      if (selectedBatch) {
        query = query.eq('batch_id', selectedBatch)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching attendance:', error)
      } else {
        // Map the data to handle the nested structure
        const attendanceData = data?.map(record => ({
          ...record,
          students: Array.isArray(record.students) ? record.students[0] : record.students || null,
          batches: Array.isArray(record.batches) ? record.batches[0] : record.batches || null
        })) || []
        setAttendanceRecords(attendanceData as AttendanceRecord[])
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUniqueBatches = () => {
    const batchMap = new Map()
    students.forEach(student => {
      student.batches.forEach(batch => {
        batchMap.set(batch.id, batch)
      })
    })
    return Array.from(batchMap.values())
  }

  const getFilteredStudents = () => {
    if (!selectedBatch) return students
    return students.filter(student => 
      student.batches.some(batch => batch.id === selectedBatch)
    )
  }

  const getAttendanceStatus = (studentId: string) => {
    const record = attendanceRecords.find(r => r.student_id === studentId)
    return record?.status || null
  }

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!user?.institute_id || !selectedBatch) return

    setSaving(true)
    try {
      // Check if attendance already exists
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('batch_id', selectedBatch)
        .eq('date', selectedDate)
        .single()

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({
            status,
            marked_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)

        if (error) {
          toast.error('Error updating attendance: ' + error.message)
          return
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            batch_id: selectedBatch,
            institute_id: user.institute_id,
            date: selectedDate,
            status,
            marked_by: user.id
          })

        if (error) {
          toast.error('Error marking attendance: ' + error.message)
          return
        }
      }

      toast.success('Attendance marked successfully!')
      fetchAttendanceRecords()
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: string | null) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mark and manage student attendance
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                Batch
              </label>
              <select
                id="batch"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="input mt-1"
              >
                <option value="">All Batches</option>
                {getUniqueBatches().map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAttendanceRecords}
                className="btn btn-secondary w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Present
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {attendanceRecords.filter(r => r.status === 'present').length}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Absent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {attendanceRecords.filter(r => r.status === 'absent').length}
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
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Late
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {attendanceRecords.filter(r => r.status === 'late').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getFilteredStudents().length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {!selectedBatch ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Batch</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a batch to mark attendance
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance for {formatDate(selectedDate)}
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {getFilteredStudents().map((student) => {
                const currentStatus = getAttendanceStatus(student.id)
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {student.student_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentStatus)}`}>
                        {currentStatus || 'Not Marked'}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => markAttendance(student.id, 'present')}
                          disabled={saving}
                          className={`p-2 rounded-md ${
                            currentStatus === 'present' 
                              ? 'bg-green-100 text-green-600' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'late')}
                          disabled={saving}
                          className={`p-2 rounded-md ${
                            currentStatus === 'late' 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          disabled={saving}
                          className={`p-2 rounded-md ${
                            currentStatus === 'absent' 
                              ? 'bg-red-100 text-red-600' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
