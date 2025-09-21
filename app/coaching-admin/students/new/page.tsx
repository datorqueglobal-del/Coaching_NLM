'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface Batch {
  id: string
  name: string
}

interface StudentFormData {
  student_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: string
  parent_name: string
  parent_phone: string
  parent_email: string
  batch_ids: string[]
}

export default function NewStudentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [batches, setBatches] = useState<Batch[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StudentFormData>()

  const selectedBatches = watch('batch_ids') || []

  useEffect(() => {
    if (user?.institute_id) {
      fetchBatches()
    }
  }, [user])

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

  const generateStudentId = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `STU${year}${random}`
  }

  const onSubmit = async (data: StudentFormData) => {
    if (!user?.institute_id) {
      toast.error('Institute ID not found')
      return
    }

    setIsLoading(true)
    try {
      // Generate student ID if not provided
      const studentId = data.student_id || generateStudentId()

      // First, create a user account for the student
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: 'student123', // Default password
        email_confirm: true,
      })

      if (authError) {
        toast.error('Error creating student account: ' + authError.message)
        return
      }

      if (!authData.user) {
        toast.error('Failed to create student account')
        return
      }

      // Create the student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          institute_id: user.institute_id,
          student_id: studentId,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address,
          parent_name: data.parent_name,
          parent_phone: data.parent_phone,
          parent_email: data.parent_email,
          is_active: true,
        })
        .select()
        .single()

      if (studentError) {
        toast.error('Error creating student: ' + studentError.message)
        return
      }

      // Enroll student in selected batches
      if (data.batch_ids && data.batch_ids.length > 0) {
        const enrollments = data.batch_ids.map(batchId => ({
          student_id: studentData.id,
          batch_id: batchId,
          institute_id: user.institute_id,
          is_active: true,
        }))

        const { error: enrollmentError } = await supabase
          .from('student_batches')
          .insert(enrollments)

        if (enrollmentError) {
          console.error('Error enrolling in batches:', enrollmentError)
          toast.error('Student created but batch enrollment failed')
        }
      }

      toast.success('Student created successfully!')
      router.push('/coaching-admin/students')
    } catch (error) {
      console.error('Error creating student:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new student profile and enroll them in batches
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
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="student_id"
                    {...register('student_id')}
                    className="input mt-1"
                    placeholder="Leave empty for auto-generation"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    If left empty, ID will be auto-generated
                  </p>
                </div>

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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input mt-1"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
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
                  href="/coaching-admin/students"
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Student
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
        </div>
      </div>
    </div>
  )
}
