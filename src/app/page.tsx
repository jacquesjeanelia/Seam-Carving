'use client'

import { useState, useEffect } from 'react'

interface UploadResponse {
  success: boolean
  filename: string
  imageUrl: string
  originalDimensions: { width: number; height: number }
  message: string
  error?: string
}

interface ProcessResponse {
  success: boolean
  message: string
  outputPath: string
  output: string
  newDimensions: { newWidth: number; newHeight: number }
  algorithm: string
  error?: string
}

export default function SeamCarvingIDE() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [processResult, setProcessResult] = useState<ProcessResponse | null>(null)
  const [newWidth, setNewWidth] = useState(200)
  const [newHeight, setNewHeight] = useState(200)
  const [algorithm, setAlgorithm] = useState<'greedy' | 'dp'>('greedy')
  const [loading, setLoading] = useState<{upload: boolean, process: boolean}>({
    upload: false,
    process: false
  })
  const [error, setError] = useState('')

  // Auto-adjust sliders when image is uploaded
  useEffect(() => {
    if (uploadResult) {
      setNewWidth(Math.floor(uploadResult.originalDimensions.width * 0.8))
      setNewHeight(Math.floor(uploadResult.originalDimensions.height * 0.8))
    }
  }, [uploadResult])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
      setProcessResult(null)
      setError('')
    }
  }

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return

    setLoading(prev => ({...prev, upload: true}))
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      const response: Response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: UploadResponse = await response.json()
      if (data.success) {
        setUploadResult(data)
      } else {
        setError(data.error || 'Upload failed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(prev => ({...prev, upload: false}))
    }
  }

  const handleProcess = async (): Promise<void> => {
    if (!uploadResult) return

    setLoading(prev => ({...prev, process: true}))
    setError('')
    try {
      const response: Response = await fetch('/api/seam-carving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadResult.filename,
          oldWidth: uploadResult.originalDimensions.width,
          oldHeight: uploadResult.originalDimensions.height,
          newWidth: newWidth,
          newHeight: newHeight,
          algorithm: algorithm
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ProcessResponse = await response.json()
      if (data.success) {
        setProcessResult(data)
      } else {
        setError(data.error || 'Processing failed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setLoading(prev => ({...prev, process: false}))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🎨 Seam Carving IDE</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '2px solid #ddd', borderRadius: '8px' }}>
        <h2>📁 Upload Image</h2>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect} 
          style={{ marginBottom: '10px' }}
        />
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || loading.upload}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading.upload ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading.upload ? 'not-allowed' : 'pointer'
          }}
        >
          {loading.upload ? 'Uploading...' : 'Upload'}
        </button>

        {uploadResult && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
            <p>✅ {uploadResult.message}</p>
            <p><strong>Original Size:</strong> {uploadResult.originalDimensions.width} × {uploadResult.originalDimensions.height} pixels</p>
          </div>
        )}
      </div>

      {/* Controls Section */}
      {uploadResult && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '2px solid #ddd', borderRadius: '8px' }}>
          <h2>🎛️ Resize Controls</h2>
          
          {/* Width Slider */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              New Width: {newWidth}px
            </label>
            <input
              type="range"
              min={50}
              max={uploadResult.originalDimensions.width}
              value={newWidth}
              onChange={(e) => setNewWidth(parseInt(e.target.value))}
              disabled={loading.process}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>50px</span>
              <span>{uploadResult.originalDimensions.width}px (original)</span>
            </div>
          </div>

          {/* Height Slider */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              New Height: {newHeight}px
            </label>
            <input
              type="range"
              min={50}
              max={uploadResult.originalDimensions.height}
              value={newHeight}
              onChange={(e) => setNewHeight(parseInt(e.target.value))}
              disabled={loading.process}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
              <span>50px</span>
              <span>{uploadResult.originalDimensions.height}px (original)</span>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Algorithm:
            </label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value as 'greedy' | 'dp')}
              disabled={loading.process}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
            >
              <option value="greedy">Greedy Algorithm</option>
              <option value="dp">Dynamic Programming</option>
            </select>
          </div>

          {/* Size Reduction Info */}
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p><strong>Size Reduction:</strong> {
              Math.round(((uploadResult.originalDimensions.width * uploadResult.originalDimensions.height) - (newWidth * newHeight)) / 
              (uploadResult.originalDimensions.width * uploadResult.originalDimensions.height) * 100)
            }%</p>
            <p><strong>Original:</strong> {uploadResult.originalDimensions.width} × {uploadResult.originalDimensions.height}</p>
            <p><strong>New:</strong> {newWidth} × {newHeight}</p>
          </div>

          {/* Process Button */}
          <button 
            onClick={handleProcess}
            disabled={loading.process}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              backgroundColor: loading.process ? '#6c757d' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading.process ? 'not-allowed' : 'pointer'
            }}
          >
            {loading.process ? '⚙️ Processing...' : '🚀 Apply Seam Carving'}
          </button>

          {processResult && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px' }}>
              <p>✅ {processResult.message}</p>
              <p><strong>Result:</strong> {processResult.newDimensions.newWidth} × {processResult.newDimensions.newHeight} pixels</p>
              <p><strong>Algorithm:</strong> {processResult.algorithm.toUpperCase()}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', color: '#721c24' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {uploadResult && (
        <div style={{ padding: '20px', border: '2px solid #ddd', borderRadius: '8px' }}>
          <h2>📊 Results</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <h3>Original</h3>
              <img 
                src={uploadResult.imageUrl} 
                alt="Original" 
                style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #ddd' }}
              />
            </div>

            {processResult && (
              <div>
                <h3>Processed</h3>
                <img 
                  src={processResult.outputPath} 
                  alt="Processed" 
                  style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #ddd' }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
