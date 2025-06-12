import { describe, it, expect } from 'vitest'
import { SAMPLE_CSV_DATA } from '../sample-data'
import { parseExcelFile } from '../../services/excel-parser'

describe('示例数据', () => {
  it('应该能正确解析示例CSV数据', async () => {
    const file = {
      size: SAMPLE_CSV_DATA.length,
      text: () => Promise.resolve(SAMPLE_CSV_DATA)
    } as File
    
    const result = await parseExcelFile(file)
    
    // 验证解析成功
    expect(result.dishes).toHaveLength(7)
    expect(result.errors).toEqual([])
    
    // 验证标签解析正确
    const yangRouChuan = result.dishes.find(dish => dish.name === '羊肉串')
    expect(yangRouChuan?.tags).toEqual(['羊肉', '烧烤'])
    
    const gongBaoJiDing = result.dishes.find(dish => dish.name === '宫保鸡丁')
    expect(gongBaoJiDing?.tags).toEqual(['鸡肉', '川菜', '下饭'])
    
    const luoSiFen = result.dishes.find(dish => dish.name === '螺蛳粉')
    expect(luoSiFen?.tags).toEqual(['螺蛳', '粉', '米粉'])
  })

  it('应该包含所有菜品类型', async () => {
    const file = {
      size: SAMPLE_CSV_DATA.length,
      text: () => Promise.resolve(SAMPLE_CSV_DATA)
    } as File
    
    const result = await parseExcelFile(file)
    
    const types = result.dishes.map(dish => dish.type)
    
    expect(types).toContain('主食')
    expect(types).toContain('主菜')
    expect(types).toContain('副菜')
    expect(types).toContain('汤')
    expect(types).toContain('点心')
  })
})