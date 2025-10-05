'use client'

import { useSeamCarver } from '@/hooks/use_seam_carver'
import { CpuChipIcon, BoltIcon } from '@heroicons/react/24/outline'

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
      
      <div className="space-y-6">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Algorithm Selection
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAlgorithm('dp')}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 ease-in-out group
                ${algorithm === 'dp'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${algorithm === 'dp'
                    ? 'bg-blue-100'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <CpuChipIcon className={`
                    w-6 h-6 transition-colors duration-200
                    ${algorithm === 'dp'
                      ? 'text-blue-600'
                      : 'text-gray-600'
                    }
                  `} />
                </div>
                <div className="text-center">
                  <p className={`
                    text-sm font-medium transition-colors duration-200
                    ${algorithm === 'dp'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                    }
                  `}>
                    Dynamic Programming
                  </p>
                  <p className={`
                    text-xs mt-1 transition-colors duration-200
                    ${algorithm === 'dp'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    }
                  `}>
                    Optimal results
                  </p>
                </div>
              </div>
              {algorithm === 'dp' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAlgorithm('greedy')}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 ease-in-out group
                ${algorithm === 'greedy'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${algorithm === 'greedy'
                    ? 'bg-blue-100'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}>
                  <BoltIcon className={`
                    w-6 h-6 transition-colors duration-200
                    ${algorithm === 'greedy'
                      ? 'text-blue-600'
                      : 'text-gray-600'
                    }
                  `} />
                </div>
                <div className="text-center">
                  <p className={`
                    text-sm font-medium transition-colors duration-200
                    ${algorithm === 'greedy'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                    }
                  `}>
                    Greedy
                  </p>
                  <p className={`
                    text-xs mt-1 transition-colors duration-200
                    ${algorithm === 'greedy'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    }
                  `}>
                    Faster processing
                  </p>
                </div>
              </div>
              {algorithm === 'greedy' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Manual Dimension Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Manual Dimension Input
          </label>
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
        </div>

        {/* Process Button */}
        <button
          onClick={processImage}
          disabled={processing || newDimensions.width === 0 || newDimensions.height === 0}
          className={`
            w-full px-4 py-3 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200
            ${processing || newDimensions.width === 0 || newDimensions.height === 0
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
