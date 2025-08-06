'use client'

import { useSeamCarver } from '@/hooks/use_seam_carver'

export function ControlsSection() {
  const { 
    uploadResponse, 
    algorithm, 
    newDimensions, 
    processing,
    setAlgorithm, 
    setNewDimensions, 
    processImage 
  } = useSeamCarver()

  if (!uploadResponse) return null

  return (
    <div className="glass-effect rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Controls</h2>
      
      <div className="space-y-4">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'greedy' | 'dp')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dp">Dynamic Programming</option>
            <option value="greedy">Greedy</option>
          </select>
        </div>

        {/* New Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <input
              type="number"
              value={newDimensions.width}
              onChange={(e) => setNewDimensions({
                ...newDimensions,
                width: parseInt(e.target.value) || 0
              })}
              max={uploadResponse.originalDimensions.width}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <input
              type="number"
              value={newDimensions.height}
              onChange={(e) => setNewDimensions({
                ...newDimensions,
                height: parseInt(e.target.value) || 0
              })}
              max={uploadResponse.originalDimensions.height}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Original: {uploadResponse.originalDimensions.width} × {uploadResponse.originalDimensions.height}
        </div>

        {/* Process Button */}
        <button
          onClick={processImage}
          disabled={processing}
          className={`
            w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
            ${processing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }
          `}
        >
          {processing ? 'Processing...' : 'Start Processing'}
        </button>
      </div>
    </div>
  )
}
