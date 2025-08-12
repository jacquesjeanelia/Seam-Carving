'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSeamCarver } from '@/hooks/use_seam_carver'
import { CloudArrowUpIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function UploadSection() {
  const { uploadedImage, uploadImage, clearUploadedImage } = useSeamCarver()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) uploadImage(file)
  }, [uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <div className="glass-effect rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Image</h2>
      
      {uploadedImage ? (
        <div className="relative p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <PhotoIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 truncate">{uploadedImage.name}</p>
              <p className="text-sm text-green-600">
                {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearUploadedImage}
              className="flex-shrink-0 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
              title="Remove image"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            PNG, JPG, JPEG, WEBP up to 10MB
          </p>
        </div>
      )}
    </div>
  )
}
