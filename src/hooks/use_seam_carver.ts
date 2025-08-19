import { create } from 'zustand'
import { SeamCarverState, UploadResponse, ProcessingResults, Algorithm, ImageDimensions } from '@/lib/types'
import toast from 'react-hot-toast'

interface SeamCarverStore extends SeamCarverState {
  setAlgorithm: (algorithm: Algorithm) => void
  setNewDimensions: (dimensions: ImageDimensions) => void
  uploadImage: (file: File) => Promise<void>
  processImage: () => Promise<void>
  clearUploadedImage: () => void
  reset: () => void
}

export const useSeamCarver = create<SeamCarverStore>((set, get) => ({
  uploadedImage: null,
  uploadResponse: null,
  processing: false,
  progress: 0,
  results: null,
  error: null,
  algorithm: 'dp',
  newDimensions: { width: 0, height: 0 },

  setAlgorithm: (algorithm) => set({ algorithm }),
  setNewDimensions: (dimensions) => set({ newDimensions: dimensions }),

  uploadImage: async (file: File) => {
    try {
      set({ uploadedImage: file, error: null })
      
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      set({ 
        uploadResponse: data,
        newDimensions: {
          width: Math.floor(data.originalDimensions.width * 0.8),
          height: Math.floor(data.originalDimensions.height * 0.8)
        }
      })
      
      toast.success('Image uploaded successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      set({ error: errorMessage })
      toast.error(errorMessage)
    }
  },

  processImage: async () => {
    const { uploadResponse, algorithm, newDimensions } = get()
    
    if (!uploadResponse) {
      toast.error('Please upload an image first')
      return
    }

    try {
      set({ processing: true, progress: 0, error: null, results: null })

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadResponse.filename,
          filePath: uploadResponse.filePath,
          oldHeight: uploadResponse.originalDimensions.height,
          oldWidth: uploadResponse.originalDimensions.width,
          newHeight: newDimensions.height,
          newWidth: newDimensions.width,
          algorithm,
        }),
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            switch (data.type) {
              case 'progress':
                set({ progress: parseInt(data.progress) })
                break
              case 'complete':
                set({ 
                  results: {
                    processedImage: data.paths.processedImage,
                    dimensions: data.dimensions,
                    algorithm: data.algorithm,
                    filename: data.filename,
                  },
                  processing: false,
                  progress: 100
                })
                toast.success('Processing completed!')
                break
              case 'error':
                throw new Error(data.message)
            }
          } catch (parseError) {
            console.warn('Failed to parse chunk:', line)
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed'
      set({ error: errorMessage, processing: false })
      toast.error(errorMessage)
    }
  },

  reset: () => set({
    uploadedImage: null,
    uploadResponse: null,
    processing: false,
    progress: 0,
    results: null,
    error: null,
    algorithm: 'dp',
    newDimensions: { width: 0, height: 0 },
  }),

  clearUploadedImage: () => set({
    uploadedImage: null,
    uploadResponse: null,
    results: null,
    error: null,
    newDimensions: { width: 0, height: 0 },
  }),
}))
