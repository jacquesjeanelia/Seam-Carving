'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [resultData, setResultData] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')

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
          energyMap: `/outputs/energy-maps/${filename}_energy_map.png`,
          seamVisualization: `/outputs/seam-visualization/${filename}_seams.png`
        }
      }
      setResultData(data)
      setSelectedImage(data.paths.processed) // Default to processed image
    }
  }, [searchParams])

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">Please process an image first.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const images = [
    { key: 'processed', path: resultData.paths.processed, label: 'Processed', description: 'Final result' },
    { key: 'original', path: resultData.paths.original, label: 'Original', description: 'Source image' },
    { key: 'energyMap', path: resultData.paths.energyMap, label: 'Energy Map', description: 'Energy visualization' },
    { key: 'seamVisualization', path: resultData.paths.seamVisualization, label: 'Seam Lines', description: 'Removed seams' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Seam Carving Results</h1>
              <p className="text-sm text-gray-500 mt-1">
                {resultData.algorithm.toUpperCase()} • {resultData.compressionRatio}% compression • 
                {resultData.originalDimensions.width}×{resultData.originalDimensions.height} → 
                {resultData.newDimensions.width}×{resultData.newDimensions.height}
              </p>
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Process Another
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Image Selector */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">View Options</h3>
            <div className="space-y-2">
              {images.map((image) => (
                <button
                  key={image.key}
                  onClick={() => setSelectedImage(image.path)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedImage === image.path
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{image.label}</div>
                  <div className={`text-sm ${
                    selectedImage === image.path ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {image.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Download Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Downloads</h3>
              <div className="space-y-2">
                {images.map((image) => (
                  <a
                    key={`download-${image.key}`}
                    href={image.path}
                    download={`${resultData.filename}_${image.key}.png`}
                    className="block w-full text-center py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {image.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Image Display */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    {images.find(img => img.path === selectedImage)?.label || 'Image'}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {selectedImage === resultData.paths.original && 
                      `${resultData.originalDimensions.width} × ${resultData.originalDimensions.height} px`}
                    {selectedImage === resultData.paths.processed && 
                      `${resultData.newDimensions.width} × ${resultData.newDimensions.height} px`}
                  </div>
                </div>
                
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={images.find(img => img.path === selectedImage)?.label}
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                    onError={(e) => {
                      console.error('Failed to load image:', selectedImage)
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMTI1VjE3NUgxNzVMMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-light text-gray-900">{resultData.compressionRatio}%</div>
                <div className="text-sm text-gray-500">Compression</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-light text-gray-900">{resultData.algorithm.toUpperCase()}</div>
                <div className="text-sm text-gray-500">Algorithm</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-light text-gray-900">
                  {resultData.originalDimensions.width - resultData.newDimensions.width}
                </div>
                <div className="text-sm text-gray-500">Pixels Removed</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-light text-gray-900">{resultData.processingTime}ms</div>
                <div className="text-sm text-gray-500">Processing Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
