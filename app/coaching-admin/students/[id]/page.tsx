'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit, Key, User, Phone, Mail, MapPin, Calendar, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  student_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  phone: string
  email: string
  address: string
  parent_name: string
  parent_phone: string
  parent_email: string
  generated_password?: string
  is_active: boolean
  created_at: string
  batches: {
    id: string
    name: string
  }[]
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    if (id && user?.institute_id) {
      fetchStudent()
    }
  }, [id, user])

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_batches!inner(
            batches!inner(
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .eq('institute_id', user?.institute_id)
        .single()

      if (error) {
        console.error('Error fetching student:', error)
        toast.error('Error fetching student details')
        return
      }

      // Transform the data to match our interface
      const studentData = {
        ...data,
        batches: data.student_batches?.map((sb: any) => sb.batches) || []
      }
      setStudent(studentData)
    } catch (error) {
      console.error('Error fetching student:', error)
      toast.error('Error fetching student details')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const response = await fetch('/api/coaching-admin/update-student-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: id,
          new_password: newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error updating password')
        return
      }

      toast.success('Password updated successfully!')
      setShowPasswordForm(false)
      setNewPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const generateNewPassword = () => {
    const instituteName = user?.institute_id ? 'institute' : 'coaching'
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const newPass = `${instituteName}${randomDigits}`
    setNewPassword(newPass)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Student not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The student you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Link href="/coaching-admin/students" className="btn btn-primary">
            Back to Students
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/coaching-admin/students"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {student.first_name} {student.last_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Student ID: {student.student_id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.first_name} {student.last_name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.student_id}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(student.date_of_birth).toLocaleDateString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{student.gender}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.phone || 'Not provided'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.address || 'Not provided'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Parent Information */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Parent Information</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Parent Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.parent_name}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Parent Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.parent_phone}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Parent Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.parent_email || 'Not provided'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Login Credentials */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Login Credentials</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{student.email}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Password</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {student.generated_password || 'Password not available'}
                  </dd>
                  <p className="mt-1 text-xs text-gray-500">
                    {student.generated_password 
                      ? 'This is the auto-generated password. Use the update button below to change it.'
                      : 'Password was not stored during creation. Use the update button to set a new password.'
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="btn btn-secondary w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </button>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordUpdate} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1 flex space-x-2">
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input flex-1"
                          placeholder="Enter new password"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={generateNewPassword}
                          className="btn btn-secondary"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setNewPassword('')
                        }}
                        className="btn btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="btn btn-primary flex-1"
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Batch Enrollment */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Batch Enrollment</h3>
            </div>
            <div className="card-content">
              {student.batches.length > 0 ? (
                <div className="space-y-2">
                  {student.batches.map((batch) => (
                    <div key={batch.id} className="flex items-center">
                      <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{batch.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not enrolled in any batches</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
            </div>
            <div className="card-content">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  student.is_active ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-900">
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Created: {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
