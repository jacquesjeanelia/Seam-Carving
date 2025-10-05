'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSeamCarver } from '@/hooks/use_seam_carver'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [resultData, setResultData] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const { reset } = useSeamCarver()

  // Download functions
  const downloadImage = async (imagePath: string, fileName: string) => {
    try {
      const response = await fetch(imagePath)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback to direct link
      const link = document.createElement('a')
      link.href = imagePath
      link.download = fileName
      link.click()
    }
  }

  useEffect(() => {
    // Extract data from URL parameters
    const filename = searchParams.get('filename')
    const algorithm = searchParams.get('algorithm')
    const originalWidth = searchParams.get('originalWidth')
    const originalHeight = searchParams.get('originalHeight')
    const newWidth = searchParams.get('newWidth')
    const newHeight = searchParams.get('newHeight')
    const compressionRatio = searchParams.get('compressionRatio')
    const processingTime = searchParams.get('processingTime')

    if (filename) {
      const data = {
        filename,
        algorithm,
        originalDimensions: { width: parseInt(originalWidth || '0'), height: parseInt(originalHeight || '0') },
        newDimensions: { width: parseInt(newWidth || '0'), height: parseInt(newHeight || '0') },
        compressionRatio: parseInt(compressionRatio || '0'),
        processingTime: parseInt(processingTime || '0'),
        paths: {
          original: `/uploads/${filename}.png`,
          processed: `/outputs/processed-images/${filename}_resized_image.png`,
          // Commenting out energy map and seam visualization since backend doesn't generate them
          // energyMap: `/outputs/energy-maps/${filename}_energy_map.png`,
          // seamVisualization: `/outputs/seam-visualization/${filename}_seams.png`
        }
      }
      setResultData(data)
      setSelectedImage(data.paths.processed) // Always show processed image since that's the only one we display
    }
  }, [searchParams])

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-12 text-center max-w-md mx-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-8">Please process an image first to view results.</p>
          <Link 
            href="/" 
            onClick={() => reset()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const allImages = [
    { key: 'processed', path: resultData.paths.processed, label: 'Processed Image', description: 'Content-aware resized result' }
    // Removed original image since user doesn't need to view it
    // Commenting out energy map and seam visualization since backend doesn't generate them
    // { key: 'energyMap', path: resultData.paths.energyMap, label: 'Energy Map', description: 'Energy visualization' },
    // { key: 'seamVisualization', path: resultData.paths.seamVisualization, label: 'Seam Lines', description: 'Removed seams' }
  ]

  // Filter to only show images that actually exist (have valid paths)
  const images = allImages.filter(image => image.path && image.path !== null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Processing Results
                </h1>
                <p className="text-gray-600">
                  {resultData.algorithm.toUpperCase()} • {resultData.compressionRatio}% compression • 
                  {resultData.originalDimensions.width}×{resultData.originalDimensions.height} → 
                  {resultData.newDimensions.width}×{resultData.newDimensions.height}
                </p>
              </div>
            </div>
            <Link 
              href="/" 
              onClick={() => reset()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Process Another Image
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Statistics Only */}
          <div className="space-y-6">
            {/* Processing Stats */}
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Results</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Compression Ratio</span>
                  <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {resultData.compressionRatio}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Algorithm</span>
                  <span className="text-sm font-medium text-gray-900">{resultData.algorithm.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pixels Removed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {resultData.originalDimensions.width - resultData.newDimensions.width}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Original Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {resultData.originalDimensions.width}×{resultData.originalDimensions.height}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Size</span>
                  <span className="text-sm font-medium text-gray-900">
                    {resultData.newDimensions.width}×{resultData.newDimensions.height}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Image Display */}
          <div className="lg:col-span-3">
            <div className="glass-effect rounded-lg overflow-hidden shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Processed Image</h2>
                    <p className="text-gray-600 mt-1">
                      {resultData.newDimensions.width} × {resultData.newDimensions.height} pixels
                    </p>
                  </div>
                  <button
                    onClick={() => downloadImage(resultData.paths.processed, `${resultData.filename}_processed.png`)}
                    className="inline-flex items-center px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Image
                  </button>
                </div>
                
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={resultData.paths.processed}
                    alt="Processed Image"
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                    onError={(e) => {
                      console.error('Failed to load image:', resultData.paths.processed)
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMTI1VjE3NUgxNzVMMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
