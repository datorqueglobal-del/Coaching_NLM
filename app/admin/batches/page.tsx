'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Edit, Trash2, Eye, Users, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Batch {
  id: string
  name: string
  description: string
  subjects: string[]
  monthly_fee: number
  start_date: string
  end_date?: string
  is_active: boolean
  created_at: string
  student_count?: number
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          student_batches!inner(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching batches:', error)
      } else {
        // Process the data to get student counts
        const processedBatches = data?.map(batch => ({
          ...batch,
          student_count: batch.student_batches?.[0]?.count || 0
        })) || []
        setBatches(processedBatches)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage course batches and their configurations
          </p>
        </div>
        <button className="btn btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search batches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full max-w-md"
        />
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{batch.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  batch.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {batch.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{batch.description}</p>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Subjects</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {batch.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Monthly Fee</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(batch.monthly_fee)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Students</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {batch.student_count || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                  <p className="text-sm text-gray-900">
                    {formatDate(batch.start_date)} - {batch.end_date ? formatDate(batch.end_date) : 'Ongoing'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-indigo-600 hover:text-indigo-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.' 
              : 'Get started by creating a new batch.'}
          </p>
        </div>
      )}
    </div>
  )
}
