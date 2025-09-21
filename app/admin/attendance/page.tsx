'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Batch {
  id: string
  name: string
  description: string
  subjects: string[]
}

interface Student {
  id: string
  student_id: string
  first_name: string
  last_name: string
}

interface AttendanceRecord {
  id: string
  student_id: string
  status: 'present' | 'absent' | 'late'
  remarks?: string
}

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch) {
      fetchStudentsForBatch(selectedBatch)
    }
  }, [selectedBatch])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching batches:', error)
      } else {
        setBatches(data || [])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const fetchStudentsForBatch = async (batchId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('student_batches')
        .select(`
          students (
            id,
            student_id,
            first_name,
            last_name
          )
        `)
        .eq('batch_id', batchId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching students:', error)
      } else {
        const studentList: Student[] = data?.map((item: any) => item.students).filter(Boolean) || []
        setStudents(studentList)
        
        // Load existing attendance for the date
        await loadExistingAttendance(batchId, studentList.map(s => s.id))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExistingAttendance = async (batchId: string, studentIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('batch_id', batchId)
        .eq('date', attendanceDate)
        .in('student_id', studentIds)

      if (error) {
        console.error('Error loading attendance:', error)
        return
      }

      const records: Record<string, AttendanceRecord> = {}
      data?.forEach(record => {
        records[record.student_id] = {
          id: record.id,
          student_id: record.student_id,
          status: record.status,
          remarks: record.remarks,
        }
      })
      setAttendanceRecords(records)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        id: prev[studentId]?.id || '',
        student_id: studentId,
        status,
        remarks: prev[studentId]?.remarks || '',
      }
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status: prev[studentId]?.status || 'present',
        remarks,
      }
    }))
  }

  const saveAttendance = async () => {
    if (!selectedBatch) return

    setSaving(true)
    try {
      const records = Object.values(attendanceRecords)
      
      // Delete existing records for this date and batch
      await supabase
        .from('attendance')
        .delete()
        .eq('batch_id', selectedBatch)
        .eq('date', attendanceDate)

      // Insert new records
      if (records.length > 0) {
        const { error } = await supabase
          .from('attendance')
          .insert(
            records.map(record => ({
              student_id: record.student_id,
              batch_id: selectedBatch,
              date: attendanceDate,
              status: record.status,
              remarks: record.remarks,
            }))
          )

        if (error) {
          console.error('Error saving attendance:', error)
          return
        }
      }

      // TODO: Send notifications for absent students
      const absentStudents = records.filter(r => r.status === 'absent')
      if (absentStudents.length > 0) {
        // Send notifications logic here
        console.log('Sending notifications for absent students:', absentStudents)
      }

      alert('Attendance saved successfully!')
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Error saving attendance')
    } finally {
      setSaving(false)
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

  const getStatusCounts = () => {
    const records = Object.values(attendanceRecords)
    return {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
    }
  }

  const counts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mark and manage student attendance for each batch
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="input w-full mt-1"
              >
                <option value="">Choose a batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attendance Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="input w-full mt-1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={saveAttendance}
                disabled={!selectedBatch || saving}
                className="btn btn-primary btn-md w-full"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {selectedBatch && students.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Present</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.present}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Absent</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.absent}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Late</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.late}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      {selectedBatch && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Student Attendance - {formatDate(attendanceDate)}
            </h3>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This batch doesn't have any enrolled students.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => {
                  const record = attendanceRecords[student.id]
                  const status = record?.status || 'present'

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.student_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Status Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              status === 'absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                            }`}
                          >
                            Late
                          </button>
                        </div>

                        {/* Remarks */}
                        <input
                          type="text"
                          placeholder="Remarks (optional)"
                          value={record?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="input w-48"
                        />

                        {/* Status Icon */}
                        {getStatusIcon(status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
