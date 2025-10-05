'use client'

import { useSeamCarver } from '@/hooks/use_seam_carver'

export function ProcessingSection() {
  const { processing, progress } = useSeamCarver()

  if (!processing) return null

  return (
    <div className="glass-effect rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-900">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">
            Processing seam carving algorithm...
          </span>
        </div>
      </div>
    </div>
  )
}
