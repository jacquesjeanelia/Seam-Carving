'use client'

import { useState, useCallback, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { ImageDimensions } from '@/lib/types'
import 'react-image-crop/dist/ReactCrop.css'

// Custom styles to override the default crop border
const cropStyles = `
  .ReactCrop__crop-selection {
    border: 2px solid #3b82f6 !important;
    border-style: solid !important;
    transition: none !important;
    animation: none !important;
  }
  
  .ReactCrop__crop-selection:before,
  .ReactCrop__crop-selection:after {
    display: none !important;
  }
  
  .ReactCrop__rule-of-thirds-h,
  .ReactCrop__rule-of-thirds-v {
    display: none !important;
  }
  
  .ReactCrop__drag-bar {
    background: transparent !important;
    border: none !important;
  }
  
  .ReactCrop__drag-bar:before,
  .ReactCrop__drag-bar:after {
    display: none !important;
  }
  
  .ReactCrop__drag-handle {
    background-color: #3b82f6 !important;
    border: none !important;
    border-radius: 50% !important;
    width: 8px !important;
    height: 8px !important;
    transition: none !important;
    animation: none !important;
    box-shadow: none !important;
  }
  
  /* Hide edge handles, keep only corner handles */
  .ReactCrop__drag-handle.ord-n,
  .ReactCrop__drag-handle.ord-s,
  .ReactCrop__drag-handle.ord-e,
  .ReactCrop__drag-handle.ord-w {
    display: none !important;
  }
  
  .ReactCrop__drag-handle:after,
  .ReactCrop__drag-handle:before {
    display: none !important;
  }
  
  .ReactCrop__crop-selection,
  .ReactCrop__drag-handle,
  .ReactCrop__drag-bar {
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
  
  .ReactCrop {
    transition: none !important;
    animation: none !important;
  }
  
  /* Remove any dotted outlines */
  .ReactCrop *,
  .ReactCrop *:before,
  .ReactCrop *:after {
    outline: none !important;
    border-style: solid !important;
  }
`

interface ImageCropSelectorProps {
  imageUrl: string
  originalDimensions: ImageDimensions
  onCropChange: (dimensions: ImageDimensions) => void
  currentDimensions: ImageDimensions
}

export function ImageCropSelector({ 
  imageUrl, 
  originalDimensions, 
  onCropChange,
  currentDimensions
}: ImageCropSelectorProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    // Set initial crop to full image (100%)
    const cropWidthInPercent = 100
    const cropHeightInPercent = 100
    const cropX = 0
    const cropY = 0
    
    const newCrop: Crop = {
      unit: '%',
      width: cropWidthInPercent,
      height: cropHeightInPercent,
      x: cropX,
      y: cropY
    }
    
    setCrop(newCrop)
    
    // Calculate actual dimensions (full original size)
    const actualWidth = originalDimensions.width
    const actualHeight = originalDimensions.height
    onCropChange({ width: actualWidth, height: actualHeight })
  }, [originalDimensions, onCropChange])

  const onCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop)
    
    if (imgRef.current && crop.width && crop.height) {
      // Get the displayed image dimensions
      const displayedWidth = imgRef.current.offsetWidth
      const displayedHeight = imgRef.current.offsetHeight
      
      // Calculate scale factors between displayed image and original image
      const scaleX = originalDimensions.width / displayedWidth
      const scaleY = originalDimensions.height / displayedHeight
      
      // Calculate actual crop dimensions
      const actualWidth = Math.round(crop.width * scaleX)
      const actualHeight = Math.round(crop.height * scaleY)
      
      // Debug logging
      console.log('Crop calculation:', {
        cropPixels: { width: crop.width, height: crop.height },
        displayedDimensions: { width: displayedWidth, height: displayedHeight },
        originalDimensions,
        scaleFactors: { scaleX, scaleY },
        actualDimensions: { width: actualWidth, height: actualHeight }
      })
      
      onCropChange({ width: actualWidth, height: actualHeight })
    }
  }, [originalDimensions, onCropChange])

  // Preset functions
  const applyPreset = useCallback((widthRatio: number, heightRatio: number) => {
    const maxWidth = originalDimensions.width
    const maxHeight = originalDimensions.height
    
    // Calculate dimensions maintaining aspect ratio
    let newWidth, newHeight
    if (maxWidth / maxHeight > widthRatio / heightRatio) {
      // Height constrained
      newHeight = maxHeight
      newWidth = Math.round(newHeight * (widthRatio / heightRatio))
    } else {
      // Width constrained
      newWidth = maxWidth
      newHeight = Math.round(newWidth * (heightRatio / widthRatio))
    }
    
    onCropChange({ width: newWidth, height: newHeight })
    
    // Update crop to match new dimensions
    const cropWidthPercent = (newWidth / originalDimensions.width) * 100
    const cropHeightPercent = (newHeight / originalDimensions.height) * 100
    const cropX = (100 - cropWidthPercent) / 2
    const cropY = (100 - cropHeightPercent) / 2
    
    setCrop({
      unit: '%',
      width: cropWidthPercent,
      height: cropHeightPercent,
      x: cropX,
      y: cropY
    })
  }, [originalDimensions, onCropChange])

  const resetCrop = useCallback(() => {
    const newCrop: Crop = {
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    }
    setCrop(newCrop)
    
    const actualWidth = originalDimensions.width
    const actualHeight = originalDimensions.height
    onCropChange({ width: actualWidth, height: actualHeight })
  }, [originalDimensions, onCropChange])

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: cropStyles }} />
      <div className="space-y-4">
      {/* Preset Buttons with Reset */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset(16, 9)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
          >
            16:9
          </button>
          <button
            onClick={() => applyPreset(4, 3)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
          >
            4:3
          </button>
          <button
            onClick={() => applyPreset(1, 1)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
          >
            1:1
          </button>
          <button
            onClick={() => {
              const width = Math.floor(originalDimensions.width * 0.8)
              const height = Math.floor(originalDimensions.height * 0.8)
              onCropChange({ width, height })
              setCrop({
                unit: '%',
                width: 80,
                height: 80,
                x: 10,
                y: 10
              })
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
          >
            80%
          </button>
          <button
            onClick={() => {
              const width = Math.floor(originalDimensions.width * 0.5)
              const height = Math.floor(originalDimensions.height * 0.5)
              onCropChange({ width, height })
              setCrop({
                unit: '%',
                width: 50,
                height: 50,
                x: 25,
                y: 25
              })
            }}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors"
          >
            50%
          </button>
        </div>
        <button
          onClick={resetCrop}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Reset crop to full image"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => onCropComplete(c)}
          aspect={undefined}
          minWidth={20}
          minHeight={20}
          ruleOfThirds={false}
          circularCrop={false}
          keepSelection={true}
          disabled={false}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop selector"
            className="max-w-full h-auto block"
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
    </div>
    </div>
  )
}
