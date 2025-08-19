export interface ImageDimensions {
  width: number
  height: number
}

export interface ProcessingResults {
  processedImage: string
  dimensions: {
    originalWidth: number
    originalHeight: number
    newWidth: number
    newHeight: number
  }
  algorithm: 'greedy' | 'dp'
  filename: string
}

export interface UploadResponse {
  success: boolean
  filename: string
  filePath: string
  originalDimensions: ImageDimensions
  message: string
}

export type Algorithm = 'greedy' | 'dp'

export interface SeamCarverState {
  uploadedImage: File | null
  uploadResponse: UploadResponse | null
  processing: boolean
  progress: number
  results: ProcessingResults | null
  error: string | null
  algorithm: Algorithm
  newDimensions: ImageDimensions
}
