import { describe, it, expect } from 'vitest'
import { validateDish } from '../dish-validator'
import type { Dish } from '@/types'

describe('菜品数据验证器', () => {
  it('应该验证合法的菜品数据', () => {
    const validDish: Dish = {
      id: 'dish_1',
      name: '红烧肉',
      price: 58,
      type: '主菜',
      temperature: '热',
      meatType: '荤',
      tags: ['猪肉', '下饭'],
      baseQuantity: 1,
      scaleWithPeople: true,
    }
    
    const result = validateDish(validDish)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝价格为负数的菜品', () => {
    const invalidDish: Dish = {
      id: 'dish_1',
      name: '红烧肉',
      price: -10,
      type: '主菜',
      tags: [],
      baseQuantity: 1,
      scaleWithPeople: false,
    }
    
    const result = validateDish(invalidDish)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('价格必须大于0')
  })

  it('应该拒绝空菜名的菜品', () => {
    const invalidDish: Dish = {
      id: 'dish_1',
      name: '',
      price: 20,
      type: '主菜',
      tags: [],
      baseQuantity: 1,
      scaleWithPeople: false,
    }
    
    const result = validateDish(invalidDish)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('菜名不能为空')
  })

  it('应该拒绝无效的菜品类型', () => {
    const invalidDish: Dish = {
      id: 'dish_1',
      name: '测试菜',
      price: 20,
      type: '无效类型' as any,
      tags: [],
      baseQuantity: 1,
      scaleWithPeople: false,
    }
    
    const result = validateDish(invalidDish)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('菜品类型必须是以下之一: 主食, 主菜, 副菜, 汤, 点心')
  })
})