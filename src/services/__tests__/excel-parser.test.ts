import { describe, it, expect, vi } from 'vitest'
import { parseExcelFile } from '../excel-parser'

// Mock File.prototype.text method
Object.defineProperty(File.prototype, 'text', {
  value: function() {
    return Promise.resolve(new TextDecoder().decode(new Uint8Array(this.stream().getReader().read().value)))
  }
})

describe('Excel文件解析器', () => {
  it('应该返回空数组当传入空文件时', async () => {
    const emptyFile = new File([], 'empty.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const result = await parseExcelFile(emptyFile)
    
    expect(result.dishes).toEqual([])
    expect(result.errors).toEqual([])
    expect(result.metadata.totalRows).toBe(0)
    expect(result.metadata.validRows).toBe(0)
  })

  it('应该解析包含基础菜品信息的Excel数据', async () => {
    // 模拟一个包含菜品数据的CSV内容
    const csvContent = `菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
红烧肉,58,主菜,热,荤,猪肉 下饭,1,Yes
蒸蛋羹,18,副菜,热,无,鸡蛋 嫩滑,1,No`
    
    // 创建一个mock文件，并手动设置text方法
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(2)
    expect(result.dishes[0]).toEqual({
      id: expect.any(String),
      name: '红烧肉',
      price: 58,
      type: '主菜',
      temperature: '热',
      meatType: '荤',
      tags: ['猪肉', '下饭'],
      baseQuantity: 1,
      scaleWithPeople: true,
    })
    expect(result.metadata.totalRows).toBe(3) // 包含标题行
    expect(result.metadata.validRows).toBe(2)
  })
})