import { describe, it, expect } from 'vitest'
import { parseCSVLine } from '../csv-parser'

describe('CSV解析器', () => {
  it('应该解析简单的CSV行', () => {
    const line = 'name,价格,类型'
    const result = parseCSVLine(line)
    
    expect(result).toEqual(['name', '价格', '类型'])
  })

  it('应该解析包含引号的CSV行', () => {
    const line = '白米饭,3,主食,热,素,"米饭,主食",1,Yes'
    const result = parseCSVLine(line)
    
    expect(result).toEqual([
      '白米饭', '3', '主食', '热', '素', '米饭,主食', '1', 'Yes'
    ])
  })

  it('应该处理引号中的逗号', () => {
    const line = '麻婆豆腐,22,副菜,热,素,"豆腐,川菜,素食",1,No'
    const result = parseCSVLine(line)
    
    expect(result).toEqual([
      '麻婆豆腐', '22', '副菜', '热', '素', '豆腐,川菜,素食', '1', 'No'
    ])
  })

  it('应该处理双引号转义', () => {
    const line = 'test,"he said ""hello""",end'
    const result = parseCSVLine(line)
    
    expect(result).toEqual(['test', 'he said "hello"', 'end'])
  })

  it('应该处理空字段', () => {
    const line = 'name,,type,,'
    const result = parseCSVLine(line)
    
    expect(result).toEqual(['name', '', 'type', '', ''])
  })
})