'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface Batch {
  id: string
  name: string
}

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
  institute_id: string
  batches: {
    id: string
    name: string
  }[]
}

interface StudentFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  address: string
  parent_name: string
  parent_phone: string
  parent_email: string
  batch_ids: string[]
}

export default function EditStudentPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StudentFormData>()

  const selectedBatches = watch('batch_ids') || []

  useEffect(() => {
    if (id && user?.institute_id) {
      fetchStudent()
      fetchBatches()
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

      // Set form values
      setValue('first_name', studentData.first_name)
      setValue('last_name', studentData.last_name)
      setValue('date_of_birth', studentData.date_of_birth)
      setValue('gender', studentData.gender as 'male' | 'female' | 'other')
      setValue('phone', studentData.phone || '')
      setValue('address', studentData.address || '')
      setValue('parent_name', studentData.parent_name)
      setValue('parent_phone', studentData.parent_phone)
      setValue('parent_email', studentData.parent_email || '')
      setValue('batch_ids', studentData.batches.map((b: any) => b.id))
    } catch (error) {
      console.error('Error fetching student:', error)
      toast.error('Error fetching student details')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('id, name')
        .eq('institute_id', user?.institute_id)
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

  const onSubmit = async (data: StudentFormData) => {
    if (!student) return

    if (data.batch_ids.length === 0) {
      toast.error('Please select at least one batch')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/coaching-admin/update-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          parent_name: data.parent_name,
          parent_phone: data.parent_phone,
          parent_email: data.parent_email,
          batch_ids: data.batch_ids,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error updating student')
        return
      }

      toast.success('Student updated successfully!')
      router.push(`/coaching-admin/students/${student.id}`)
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
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
          The student you're looking for doesn't exist or you don't have permission to edit it.
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
          href={`/coaching-admin/students/${student.id}`}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update {student.first_name} {student.last_name}'s information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    {...register('first_name', { required: 'First name is required' })}
                    className="input mt-1"
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    {...register('last_name', { required: 'Last name is required' })}
                    className="input mt-1"
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                    className="input mt-1"
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    {...register('gender', { required: 'Gender is required' })}
                    className="input mt-1"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="input mt-1"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    {...register('address')}
                    className="input mt-1"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href={`/coaching-admin/students/${student.id}`}
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Parent Information & Batch Selection */}
        <div className="space-y-6">
          {/* Parent Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Parent Information</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700">
                    Parent Name *
                  </label>
                  <input
                    type="text"
                    id="parent_name"
                    {...register('parent_name', { required: 'Parent name is required' })}
                    className="input mt-1"
                    placeholder="Enter parent name"
                  />
                  {errors.parent_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.parent_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700">
                    Parent Phone *
                  </label>
                  <input
                    type="tel"
                    id="parent_phone"
                    {...register('parent_phone', { required: 'Parent phone is required' })}
                    className="input mt-1"
                    placeholder="Enter parent phone"
                  />
                  {errors.parent_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    id="parent_email"
                    {...register('parent_email')}
                    className="input mt-1"
                    placeholder="Enter parent email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Batch Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Batch Enrollment</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <label key={batch.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={batch.id}
                        {...register('batch_ids')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">{batch.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active batches available</p>
                )}
              </div>
            </div>
          </div>

          {/* Login Credentials Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Login Credentials</h3>
            </div>
            <div className="card-content">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Email & Password
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p><strong>Email:</strong> {student.email}</p>
                      <p className="mt-1 text-xs">
                        Email cannot be changed. To update password, go to the student detail page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
