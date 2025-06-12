import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../file-upload'

describe('FileUpload组件', () => {
  it('应该渲染文件上传区域', () => {
    const mockOnFileSelect = vi.fn()
    
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    expect(screen.getByText(/点击上传或拖拽文件/)).toBeInTheDocument()
    expect(screen.getByText(/支持 .xlsx, .xls, .csv 格式/)).toBeInTheDocument()
  })

  it('应该在文件选择时调用回调函数', async () => {
    const mockOnFileSelect = vi.fn()
    const user = userEvent.setup()
    
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const csvContent = 'name,price\n红烧肉,58'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    const input = screen.getByLabelText(/选择文件/)
    await user.upload(input, file)
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file)
  })

  it('应该显示加载状态', () => {
    const mockOnFileSelect = vi.fn()
    
    render(<FileUpload onFileSelect={mockOnFileSelect} loading={true} />)
    
    expect(screen.getByText(/正在处理文件.../)).toBeInTheDocument()
  })
})