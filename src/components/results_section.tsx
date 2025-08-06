'use client'

import { useState } from 'react'
import { useSeamCarver } from '@/hooks/use_seam_carver'

export function ResultsSection() {
  const { results } = useSeamCarver()
  const [activeTab, setActiveTab] = useState<'processed' | 'energy' | 'seams'>('processed')

  if (!results) return null

  const tabs = [
    { id: 'processed', label: 'Processed Image', image: results.processedImage },
    { id: 'energy', label: 'Energy Map', image: results.energyMap },
    { id: 'seams', label: 'Seam Visualization', image: results.seamVisualization },
  ] as const

  return (
    <div className="glass-effect rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Results</h2>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Image Display */}
      <div className="space-y-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            <img
              src={tab.image}
              alt={tab.label}
              className="w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Failed to load image:', tab.image)
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMTI1VjE3NUgxNzVMMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K'
              }}
            />
          </div>
        ))}
        
        {/* Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Original:</span>{' '}
            {results.dimensions.originalWidth} × {results.dimensions.originalHeight}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">New:</span>{' '}
            {results.dimensions.newWidth} × {results.dimensions.newHeight}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Algorithm:</span>{' '}
            {results.algorithm.toUpperCase()}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Reduction:</span>{' '}
            {Math.round((1 - (results.dimensions.newWidth * results.dimensions.newHeight) / (results.dimensions.originalWidth * results.dimensions.originalHeight)) * 100)}%
          </div>
        </div>
      </div>
    </div>
  )
}
