'use client'

import { useEffect, useState } from 'react'

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return

    const startTime = performance.now()

    // Monitor page load time
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }))
    }

    // Monitor memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) 
        }))
      }
    }

    // Monitor render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({ 
            ...prev, 
            renderTime: Math.round(entry.duration) 
          }))
        }
      })
    })

    observer.observe({ entryTypes: ['measure'] })

    window.addEventListener('load', handleLoad)
    
    const interval = setInterval(updateMemoryUsage, 1000)

    return () => {
      window.removeEventListener('load', handleLoad)
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div>Load: {metrics.loadTime}ms</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
    </div>
  )
}
