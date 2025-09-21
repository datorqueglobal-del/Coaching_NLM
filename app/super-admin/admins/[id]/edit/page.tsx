'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Users, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Institute {
  id: string
  name: string
}

interface AdminFormData {
  email: string
  institute_id: string
  is_active: boolean
}

export default function EditAdminPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [institutes, setInstitutes] = useState<Institute[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminFormData>()

  useEffect(() => {
    if (params.id) {
      fetchAdmin()
      fetchInstitutes()
    }
  }, [params.id])

  const fetchAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, institute_id, is_active')
        .eq('id', params.id)
        .eq('role', 'coaching_admin')
        .single()

      if (error) {
        console.error('Error fetching admin:', error)
        toast.error('Error loading admin details')
      } else {
        reset({
          email: data.email,
          institute_id: data.institute_id,
          is_active: data.is_active,
        })
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
      toast.error('Error loading admin details')
    } finally {
      setLoading(false)
    }
  }

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
      const { error } = await supabase
        .from('users')
        .update({
          email: data.email,
          institute_id: data.institute_id,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) {
        toast.error('Error updating admin: ' + error.message)
        return
      }

      toast.success('Admin updated successfully!')
      router.push(`/super-admin/admins/${params.id}`)
    } catch (error) {
      console.error('Error updating admin:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
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
      <div className="flex items-center">
        <Link
          href={`/super-admin/admins/${params.id}`}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Coaching Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update admin information and settings
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

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="is_active"
                    type="checkbox"
                    {...register('is_active')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active Status
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Uncheck to deactivate this admin account
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href={`/super-admin/admins/${params.id}`}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Admin
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
