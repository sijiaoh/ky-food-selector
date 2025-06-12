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
    
    // 验证标签解析正确 - 混合逗号和空格分隔符
    const baiMiFan = result.dishes.find(dish => dish.name === '白米饭')
    expect(baiMiFan?.tags).toEqual(['米饭', '主食'])
    
    const hongShaoRou = result.dishes.find(dish => dish.name === '红烧肉')
    expect(hongShaoRou?.tags).toEqual(['猪肉', '红烧', '下饭'])
    
    const maPoDuoFu = result.dishes.find(dish => dish.name === '麻婆豆腐')
    expect(maPoDuoFu?.tags).toEqual(['豆腐', '川菜', '素食'])
    
    const lvDouSha = result.dishes.find(dish => dish.name === '绿豆沙')
    expect(lvDouSha?.tags).toEqual(['绿豆', '甜品', '消暑'])
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

  it('应该有合理的价格范围', async () => {
    const file = {
      size: SAMPLE_CSV_DATA.length,
      text: () => Promise.resolve(SAMPLE_CSV_DATA)
    } as File
    
    const result = await parseExcelFile(file)
    
    const prices = result.dishes.map(dish => dish.price)
    
    // 验证价格在合理范围内 (3-40元)
    expect(Math.min(...prices)).toBeGreaterThanOrEqual(3)
    expect(Math.max(...prices)).toBeLessThanOrEqual(40)
    
    // 验证主食价格相对较低
    const mainFood = result.dishes.find(dish => dish.name === '白米饭')
    expect(mainFood?.price).toBeLessThanOrEqual(5)
  })

  it('应该有合理的荤素搭配', async () => {
    const file = {
      size: SAMPLE_CSV_DATA.length,
      text: () => Promise.resolve(SAMPLE_CSV_DATA)
    } as File
    
    const result = await parseExcelFile(file)
    
    const meatDishes = result.dishes.filter(dish => dish.meatType === '荤')
    const vegDishes = result.dishes.filter(dish => dish.meatType === '素')
    
    // 验证有荤有素
    expect(meatDishes.length).toBeGreaterThan(0)
    expect(vegDishes.length).toBeGreaterThan(0)
    
    // 验证荤菜价格通常较高
    const avgMeatPrice = meatDishes.reduce((sum, dish) => sum + dish.price, 0) / meatDishes.length
    const avgVegPrice = vegDishes.reduce((sum, dish) => sum + dish.price, 0) / vegDishes.length
    
    expect(avgMeatPrice).toBeGreaterThan(avgVegPrice)
  })
})