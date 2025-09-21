'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-optimized'
import { supabase } from '@/lib/supabase'
import { GraduationCap, Plus, Search, Edit, Trash2, Eye, Users, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Batch {
  id: string
  name: string
  description: string
  subjects: string[]
  monthly_fee: number
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  student_count: number
}

export default function BatchesPage() {
  const { user } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (user?.institute_id) {
      fetchBatches()
    }
  }, [user])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          id,
          name,
          description,
          subjects,
          monthly_fee,
          start_date,
          end_date,
          is_active,
          created_at
        `)
        .eq('institute_id', user?.institute_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching batches:', error)
      } else {
        // Fetch student count for each batch
        const batchesWithCounts = await Promise.all(
          (data || []).map(async (batch) => {
            const { count } = await supabase
              .from('student_batches')
              .select('*', { count: 'exact', head: true })
              .eq('batch_id', batch.id)
              .eq('is_active', true)

            return {
              ...batch,
              student_count: count || 0
            }
          })
        )
        setBatches(batchesWithCounts)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && batch.is_active) ||
      (filterActive === 'inactive' && !batch.is_active)
    
    return matchesSearch && matchesFilter
  })

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return

    try {
      const { error } = await supabase
        .from('batches')
        .update({ is_active: false })
        .eq('id', batchId)

      if (error) {
        console.error('Error deleting batch:', error)
        alert('Error deleting batch')
      } else {
        fetchBatches() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
      alert('Error deleting batch')
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
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your institute's batches and classes
          </p>
        </div>
        <Link href="/coaching-admin/batches/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
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
            <option value="all">All Batches</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new batch.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{batch.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{batch.description}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{batch.student_count} students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Started {formatDate(batch.start_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>${batch.monthly_fee}/month</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
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
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      batch.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {batch.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/coaching-admin/batches/${batch.id}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/coaching-admin/batches/${batch.id}/edit`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
