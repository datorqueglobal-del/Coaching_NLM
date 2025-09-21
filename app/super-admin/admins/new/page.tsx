'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateUsername, generatePassword } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Users, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Institute {
  id: string
  name: string
}

interface AdminFormData {
  email: string
  password: string
  institute_id: string
}

export default function NewCoachingAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdminFormData>()

  const selectedInstituteId = watch('institute_id')

  useEffect(() => {
    fetchInstitutes()
  }, [])

  const fetchInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('id, name')
        .eq('subscription_status', 'active')
        .order('name')

      if (error) {
        console.error('Error fetching institutes:', error)
      } else {
        setInstitutes(data || [])
      }
    } catch (error) {
      console.error('Error fetching institutes:', error)
    }
  }

  const onSubmit = async (data: AdminFormData) => {
    setIsLoading(true)
    try {
      // Generate credentials if not provided
      const email = data.email || `${generateUsername('admin', 'user')}@coaching.com`
      const password = data.password || generatePassword(8)

      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (authError) {
        toast.error('Error creating auth user: ' + authError.message)
        return
      }

      if (!authData.user) {
        toast.error('Failed to create user account')
        return
      }

      // Then, create the user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'coaching_admin',
          institute_id: data.institute_id,
          is_active: true,
        })
        .select()
        .single()

      if (userError) {
        toast.error('Error creating admin: ' + userError.message)
        return
      }

      setGeneratedCredentials({ email, password })
      toast.success('Coaching admin created successfully!')
    } catch (error) {
      console.error('Error creating admin:', error)
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
            href="/super-admin/admins"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Created Successfully</h1>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Coaching Admin Credentials</h3>
            <p className="text-sm text-gray-500">
              Please provide these credentials to the coaching admin for login
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 p-3 bg-gray-50 border rounded-md font-mono">
                  {generatedCredentials.email}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Coaching admin can use this email to login
                </p>
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
                href="/super-admin/admins"
                className="btn btn-primary btn-md"
              >
                Back to Admins
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
          href="/super-admin/admins"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Coaching Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new coaching administrator for an institute
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Admin Information</h3>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="institute_id" className="block text-sm font-medium text-gray-700">
                  Institute *
                </label>
                <select
                  id="institute_id"
                  {...register('institute_id', { required: 'Institute is required' })}
                  className="input mt-1"
                >
                  <option value="">Select an institute</option>
                  {institutes.map((institute) => (
                    <option key={institute.id} value={institute.id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
                {errors.institute_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.institute_id.message}</p>
                )}
              </div>

              <div>
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="input mt-1"
                  placeholder="Leave empty for auto-generation"
                />
                <p className="mt-1 text-sm text-gray-500">
                  If left empty, password will be auto-generated
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/super-admin/admins"
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
                    Create Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
