import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

interface UseOptimizedDataOptions {
  cacheKey?: string
  cacheDuration?: number
  enabled?: boolean
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>()

export function useOptimizedData<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseOptimizedDataOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    enabled = true
  } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Check cache first
    if (cacheKey) {
      const cached = dataCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const result = await queryFn()

      if (!abortControllerRef.current.signal.aborted) {
        setData(result)
        
        // Cache the result
        if (cacheKey) {
          dataCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          })
        }
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err as Error)
        console.error('Data fetching error:', err)
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false)
      }
    }
  }, [...dependencies, enabled, cacheKey, cacheDuration])

  useEffect(() => {
    fetchData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  const refetch = useCallback(() => {
    if (cacheKey) {
      dataCache.delete(cacheKey)
    }
    fetchData()
  }, [fetchData, cacheKey])

  return { data, loading, error, refetch }
}

// Optimized Supabase query hook
export function useSupabaseQuery<T>(
  table: string,
  select: string = '*',
  filters: Record<string, any> = {},
  options: UseOptimizedDataOptions = {}
) {
  const queryFn = useCallback(async () => {
    let query = supabase.from(table).select(select)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as T
  }, [table, select, JSON.stringify(filters)])

  return useOptimizedData(queryFn, [table, select, JSON.stringify(filters)], options)
}
