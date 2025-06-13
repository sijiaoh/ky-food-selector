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
宫保鸡丁,25,主菜,热,荤,"鸡肉,川菜,下饭",1,No`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0]?.tags).toEqual(['鸡肉', '川菜', '下饭'])
  })

  it('应该支持不同的列顺序（基于表头字段名）', async () => {
    // 测试列顺序不同的情况
    const csvContent = `价格,菜名,根据人数加量,类型,标签,温度,荤素,基础个数
25,宫保鸡丁,No,主菜,"鸡肉,川菜",热,荤,1`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0]).toEqual({
      id: expect.any(String),
      name: '宫保鸡丁',
      price: 25,
      type: '主菜',
      temperature: '热',
      meatType: '荤',
      tags: ['鸡肉', '川菜'],
      baseQuantity: 1,
      scaleWithPeople: false,
    })
  })

  it('应该处理缺少可选字段的情况', async () => {
    // 只包含必需字段
    const csvContent = `菜名,价格,类型
简单菜,20,主菜`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0]).toEqual({
      id: expect.any(String),
      name: '简单菜',
      price: 20,
      type: '主菜',
      tags: [],
      baseQuantity: 1,
      scaleWithPeople: false,
    })
    expect(result.warnings).toContain('未找到"温度"字段，将使用默认值')
    expect(result.warnings).toContain('未找到"荤素"字段，将使用默认值')
  })

  it('应该返回错误当缺少必需字段时', async () => {
    // 缺少必需字段"价格"
    const csvContent = `菜名,类型
测试菜,主菜`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.message).toContain('缺少必需字段：价格')
  })

  it('应该支持不同的字段名变体', async () => {
    // 使用不同的字段名
    const csvContent = `菜品名称,单价,分类,冷热,荤/素,特色,个数,按人数
测试菜,30,副菜,冷,素,清淡,2,是`
    
    const file = {
      size: csvContent.length,
      text: () => Promise.resolve(csvContent)
    } as File
    
    const result = await parseExcelFile(file)
    
    expect(result.dishes).toHaveLength(1)
    expect(result.dishes[0]).toEqual({
      id: expect.any(String),
      name: '测试菜',
      price: 30,
      type: '副菜',
      temperature: '冷',
      meatType: '素',
      tags: ['清淡'],
      baseQuantity: 2,
      scaleWithPeople: true,
    })
  })
})