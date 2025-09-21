'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateUsername, generatePassword } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface StudentFormData {
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
}

export default function NewStudentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string
    password: string
  } | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StudentFormData>()

  const firstName = watch('first_name')
  const lastName = watch('last_name')

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true)
    try {
      // Generate credentials
      const username = generateUsername(data.first_name, data.last_name)
      const password = generatePassword(8)

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: password,
        email_confirm: true,
      })

      if (authError) {
        toast.error('Error creating user account: ' + authError.message)
        return
      }

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          role: 'student',
        })

      if (userError) {
        toast.error('Error creating user record: ' + userError.message)
        return
      }

      // Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          student_id: `STU${Date.now().toString().slice(-4)}`, // Simple ID generation
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
        })

      if (studentError) {
        toast.error('Error creating student record: ' + studentError.message)
        return
      }

      setGeneratedCredentials({ username, password })
      toast.success('Student created successfully!')
    } catch (error) {
      console.error('Error creating student:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (generatedCredentials) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link
            href="/admin/students"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Student Created Successfully</h1>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Student Credentials</h3>
            <p className="text-sm text-gray-500">
              Please provide these credentials to the student for login
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username/Email</label>
                <div className="mt-1 p-3 bg-gray-50 border rounded-md font-mono">
                  {generatedCredentials.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 p-3 bg-gray-50 border rounded-md font-mono">
                  {generatedCredentials.password}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/admin/students"
                className="btn btn-primary btn-md"
              >
                Back to Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/students"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Student Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    type="text"
                    className="input w-full mt-1"
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    type="text"
                    className="input w-full mt-1"
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                    type="date"
                    className="input w-full mt-1"
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="input w-full mt-1"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input w-full mt-1"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input w-full mt-1"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="input w-full mt-1"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Parent/Guardian Information</h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Name *
                </label>
                <input
                  {...register('parent_name', { required: 'Parent name is required' })}
                  type="text"
                  className="input w-full mt-1"
                  placeholder="Enter parent/guardian name"
                />
                {errors.parent_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Phone *
                </label>
                <input
                  {...register('parent_phone', { required: 'Parent phone is required' })}
                  type="tel"
                  className="input w-full mt-1"
                  placeholder="Enter parent phone number"
                />
                {errors.parent_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Email
                </label>
                <input
                  {...register('parent_email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input w-full mt-1"
                  placeholder="Enter parent email address"
                />
                {errors.parent_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_email.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/students"
            className="btn btn-secondary btn-md"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-md"
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
  )
}
