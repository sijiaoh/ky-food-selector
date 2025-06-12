import { describe, it, expect } from 'vitest'
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
    // 根据docs/menu_excel_example.md中的示例数据
    const csvContent = `菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
羊肉串,10,副菜,冷,荤,羊肉 烧烤,1,
牛肉面,1,主菜,热,,牛肉 面,100,Yes
螺蛳粉,300,主食,,素,标签,3,`
    
    // 创建一个mock文件，并手动设置text方法
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(3)
    expect(result.dishes[0]).toEqual({
      id: expect.any(String),
      name: '羊肉串',
      price: 10,
      type: '副菜',
      temperature: '冷',
      meatType: '荤',
      tags: ['羊肉', '烧烤'],
      baseQuantity: 1,
      scaleWithPeople: false,
    })
    expect(result.dishes[1]).toEqual({
      id: expect.any(String),
      name: '牛肉面',
      price: 1,
      type: '主菜',
      temperature: '热',
      tags: ['牛肉', '面'],
      baseQuantity: 100,
      scaleWithPeople: true,
    })
    expect(result.metadata.totalRows).toBe(4) // 包含标题行
    expect(result.metadata.validRows).toBe(3)
  })

  it('应该支持逗号分隔的标签格式', async () => {
    const csvContent = `菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
宫保鸡丁,25,主菜,热,荤,鸡肉,川菜,下饭,1,No`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0]?.tags).toEqual(['鸡肉', '川菜', '下饭'])
  })
})