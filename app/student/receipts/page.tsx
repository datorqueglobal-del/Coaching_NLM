'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-optimized'
import { FileText, Download, Search, Filter } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Receipt {
  id: string
  receipt_number: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  paid_date: string | null
  payment_method: string | null
  created_at: string
  batch: {
    name: string
  }
}

export default function StudentReceiptsPage() {
  const { user } = useAuth()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchReceipts()
    }
  }, [user])

  const fetchReceipts = async () => {
    try {
      // First get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!student) return

      // Then get fee payments with batch info
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          id,
          receipt_number,
          amount,
          status,
          due_date,
          paid_date,
          payment_method,
          created_at,
          batches (
            name
          )
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching receipts:', error)
      } else {
        const receiptsData = data?.map(receipt => ({
          ...receipt,
          batch: receipt.batches[0] || { name: 'Unknown Batch' }
        })) || []
        setReceipts(receiptsData)
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.batch.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const downloadReceipt = (receipt: Receipt) => {
    // In a real application, this would generate and download a PDF
    console.log('Downloading receipt:', receipt.receipt_number)
    // For now, just show an alert
    alert(`Receipt ${receipt.receipt_number} download would start here`)
  }

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and download your payment receipts
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  className="input pl-10"
                  placeholder="Search by receipt number or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

      {/* Receipts List */}
      <div className="card">
        <div className="card-content">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria.'
                  : 'You don\'t have any receipts yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {receipt.receipt_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receipt.batch.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(receipt.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                          {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(receipt.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receipt.paid_date ? formatDate(receipt.paid_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => downloadReceipt(receipt)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
