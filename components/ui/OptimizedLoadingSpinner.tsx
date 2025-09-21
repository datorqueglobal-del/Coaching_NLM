import { memo } from 'react'

const OptimizedLoadingSpinner = memo(() => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  )
})

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner'

export default OptimizedLoadingSpinner
