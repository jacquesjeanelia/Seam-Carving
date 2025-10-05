'use client'

import { useSeamCarver } from '@/hooks/use_seam_carver'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ResultsSection() {
  const { results } = useSeamCarver()
  const router = useRouter()

  useEffect(() => {
    if (results) {
      // Calculate compression ratio
      const compressionRatio = Math.round((1 - (results.dimensions.newWidth * results.dimensions.newHeight) / (results.dimensions.originalWidth * results.dimensions.originalHeight)) * 100)
      
      // Create URL parameters for results page
      const params = new URLSearchParams({
        filename: results.filename,
        algorithm: results.algorithm,
        originalWidth: results.dimensions.originalWidth.toString(),
        originalHeight: results.dimensions.originalHeight.toString(),
        newWidth: results.dimensions.newWidth.toString(),
        newHeight: results.dimensions.newHeight.toString(),
        compressionRatio: compressionRatio.toString(),
        processingTime: '0' // Add actual processing time if available
      })

      // Redirect to results page
      router.push(`/results?${params.toString()}`)
    }
  }, [results, router])

  if (!results) return null

  // Show a brief loading message while redirecting
  return (
    <div className="glass-effect rounded-lg p-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Complete!</h2>
        <p className="text-gray-600">Redirecting to results page...</p>
      </div>
    </div>
  )
}
