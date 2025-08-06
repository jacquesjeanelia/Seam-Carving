'use client'

import { useState } from 'react'
import { useSeamCarver } from '@/hooks/use_seam_carver'
import { UploadSection } from './upload_section'
import { ControlsSection } from './controls_section'
import { ProcessingSection } from './processing_section'
import { ResultsSection } from './results_section'
import { CpuChipIcon } from '@heroicons/react/24/outline'

export function SeamCarverApp() {
  const { uploadResponse, processing, results, reset } = useSeamCarver()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <CpuChipIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Seam Carving IDE
                </h1>
                <p className="text-gray-600">Content-aware image resizing</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <UploadSection />
            {uploadResponse && <ControlsSection />}
            {processing && <ProcessingSection />}
          </div>

          {/* Right Column - Display */}
          <div className="lg:col-span-2">
            {results ? (
              <ResultsSection />
            ) : uploadResponse ? (
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Original Image</h3>
                <img
                  src={uploadResponse.filePath}
                  alt="Original"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="mt-4 text-sm text-gray-600">
                  {uploadResponse.originalDimensions.width} × {uploadResponse.originalDimensions.height} pixels
                </div>
              </div>
            ) : (
              <div className="glass-effect rounded-lg p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No image uploaded</h3>
                <p className="text-gray-600">Upload an image to start processing</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
