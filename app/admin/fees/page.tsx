'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, Plus, Search, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface FeePayment {
  id: string
  student_id: string
  batch_id: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  paid_date?: string
  payment_method?: string
  receipt_number?: string
  students: {
    student_id: string
    first_name: string
    last_name: string
  }
  batches: {
    name: string
  }
}

export default function FeesPage() {
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          students (
            student_id,
            first_name,
            last_name
          ),
          batches (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
      } else {
        setPayments(data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.students.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.students.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.students.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.batches.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalStats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
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
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage student fee payments
          </p>
        </div>
        <button className="btn btn-primary btn-md">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Fees</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.total)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.paid)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.pending)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalStats.overdue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.students.student_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.students.first_name} {payment.students.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.batches.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.paid_date ? formatDate(payment.paid_date) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.receipt_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    {payment.status !== 'paid' && (
                      <button className="text-green-600 hover:text-green-900">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding a new payment.'}
          </p>
        </div>
      )}
    </div>
  )
}
