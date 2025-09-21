'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import Link from 'next/link'

interface InstituteFormData {
  name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  address: string
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  max_students: number
}

export default function NewInstitutePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstituteFormData>()

  const onSubmit = async (data: InstituteFormData) => {
    setIsLoading(true)
    try {
      const { data: instituteData, error } = await supabase
        .from('institutes')
        .insert({
          name: data.name,
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          subscription_plan: data.subscription_plan,
          max_students: data.max_students,
          subscription_status: 'trial',
        })
        .select()
        .single()

      if (error) {
        toast.error('Error creating institute: ' + error.message)
        return
      }

      toast.success('Institute created successfully!')
      router.push('/super-admin/institutes')
    } catch (error) {
      console.error('Error creating institute:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/super-admin/institutes"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Institute</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new coaching institute to the system
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Institute Information</h3>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Institute Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Institute name is required' })}
                  className="input mt-1"
                  placeholder="Enter institute name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                  Contact Person *
                </label>
                <input
                  type="text"
                  id="contact_person"
                  {...register('contact_person', { required: 'Contact person is required' })}
                  className="input mt-1"
                  placeholder="Enter contact person name"
                />
                {errors.contact_person && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_person.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  {...register('contact_email', { 
                    required: 'Contact email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input mt-1"
                  placeholder="Enter contact email"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  {...register('contact_phone', { required: 'Contact phone is required' })}
                  className="input mt-1"
                  placeholder="Enter contact phone"
                />
                {errors.contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  id="address"
                  rows={3}
                  {...register('address', { required: 'Address is required' })}
                  className="input mt-1"
                  placeholder="Enter institute address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700">
                  Subscription Plan *
                </label>
                <select
                  id="subscription_plan"
                  {...register('subscription_plan', { required: 'Subscription plan is required' })}
                  className="input mt-1"
                >
                  <option value="basic">Basic - 100 students</option>
                  <option value="premium">Premium - 500 students</option>
                  <option value="enterprise">Enterprise - Unlimited</option>
                </select>
                {errors.subscription_plan && (
                  <p className="mt-1 text-sm text-red-600">{errors.subscription_plan.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                  Max Students *
                </label>
                <input
                  type="number"
                  id="max_students"
                  {...register('max_students', { 
                    required: 'Max students is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    max: { value: 10000, message: 'Must be less than 10,000' }
                  })}
                  className="input mt-1"
                  placeholder="Enter max students"
                  defaultValue={100}
                />
                {errors.max_students && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_students.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/super-admin/institutes"
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
                    Create Institute
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
