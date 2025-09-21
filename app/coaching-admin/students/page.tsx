'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Student {
  id: string
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  parent_name: string
  parent_phone: string
  is_active: boolean
  created_at: string
  batches: {
    id: string
    name: string
  }[]
}

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (user?.institute_id) {
      fetchStudents()
    }
  }, [user])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          first_name,
          last_name,
          email,
          phone,
          parent_name,
          parent_phone,
          is_active,
          created_at,
          student_batches (
            batches (
              id,
              name
            )
          )
        `)
        .eq('institute_id', user?.institute_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching students:', error)
      } else {
        // Map the data to handle the nested structure
        const studentsData = data?.map(student => ({
          ...student,
          batches: student.student_batches?.map((sb: any) => sb.batches) || []
        })) || []
        setStudents(studentsData as Student[])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && student.is_active) ||
      (filterActive === 'inactive' && !student.is_active)
    
    return matchesSearch && matchesFilter
  })

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', studentId)

      if (error) {
        console.error('Error deleting student:', error)
        alert('Error deleting student')
      } else {
        fetchStudents() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Error deleting student')
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your institute's students
          </p>
        </div>
        <Link href="/coaching-admin/students/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="input"
          >
            <option value="all">All Students</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new student.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <li key={student.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            ID: {student.student_id} • {student.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Parent: {student.parent_name} • {student.parent_phone}
                          </p>
                          {student.batches.length > 0 && (
                            <p className="text-sm text-gray-500">
                              Batches: {student.batches.map(b => b.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/coaching-admin/students/${student.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/coaching-admin/students/${student.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
