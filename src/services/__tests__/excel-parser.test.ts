import { describe, it, expect } from 'vitest'
import { parseExcelFile } from '../excel-parser'

describe('Excel文件解析器', () => {
  it('应该返回空数组当传入空文件时', async () => {
    const emptyFile = new File([], 'empty.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const result = await parseExcelFile(emptyFile)
    
    expect(result.dishes).toEqual([])
    expect(result.errors).toEqual([])
    expect(result.metadata.totalRows).toBe(0)
    expect(result.metadata.validRows).toBe(0)
  })
})