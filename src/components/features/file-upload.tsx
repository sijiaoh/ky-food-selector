import { useRef, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  loading?: boolean
}

export function FileUpload({ onFileSelect, loading = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file) {
      onFileSelect(file)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="file-upload loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>正在处理文件...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`file-upload ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="选择文件"
      />
      
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <p className="upload-text">点击上传或拖拽文件到此处</p>
        <p className="upload-hint">支持 .xlsx, .xls, .csv 格式</p>
      </div>
    </div>
  )
}