'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-username'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, GraduationCap, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface BatchFormData {
  name: string
  description: string
  subjects: string[]
  monthly_fee: number
  start_date: string
  end_date: string
}

export default function NewBatchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BatchFormData>({
    defaultValues: {
      subjects: []
    }
  })

  const subjects = watch('subjects') || []

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setValue('subjects', [...subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const removeSubject = (subjectToRemove: string) => {
    setValue('subjects', subjects.filter(subject => subject !== subjectToRemove))
  }

  const onSubmit = async (data: BatchFormData) => {
    if (!user?.institute_id) {
      toast.error('Institute ID not found')
      return
    }

    if (data.subjects.length === 0) {
      toast.error('Please add at least one subject')
      return
    }

    setIsLoading(true)
    try {
      const { data: batchData, error } = await supabase
        .from('batches')
        .insert({
          institute_id: user.institute_id,
          name: data.name,
          description: data.description,
          subjects: data.subjects,
          monthly_fee: data.monthly_fee,
          start_date: data.start_date,
          end_date: data.end_date || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        toast.error('Error creating batch: ' + error.message)
        return
      }

      toast.success('Batch created successfully!')
      router.push('/coaching-admin/batches')
    } catch (error) {
      console.error('Error creating batch:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/coaching-admin/batches"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new batch for your students
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Batch Information</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Batch name is required' })}
                    className="input mt-1"
                    placeholder="e.g., Class 10 Science, JEE Main 2024"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    {...register('description')}
                    className="input mt-1"
                    placeholder="Describe the batch objectives and curriculum"
                  />
                </div>

                <div>
                  <label htmlFor="monthly_fee" className="block text-sm font-medium text-gray-700">
                    Monthly Fee *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="monthly_fee"
                      {...register('monthly_fee', { 
                        required: 'Monthly fee is required',
                        min: { value: 0, message: 'Fee must be positive' }
                      })}
                      className="input pl-7"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  {errors.monthly_fee && (
                    <p className="mt-1 text-sm text-red-600">{errors.monthly_fee.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    {...register('start_date', { required: 'Start date is required' })}
                    className="input mt-1"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    {...register('end_date')}
                    className="input mt-1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty for ongoing batch
                  </p>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subjects *
                </label>
                <div className="mt-1 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="input flex-1"
                      placeholder="Add a subject (e.g., Mathematics, Physics)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSubject()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSubject}
                      className="btn btn-secondary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {subjects.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Add subjects that will be taught in this batch
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/coaching-admin/batches"
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
                      Create Batch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
