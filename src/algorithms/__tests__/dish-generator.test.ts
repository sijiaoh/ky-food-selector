import { describe, it, expect } from 'vitest'
import { generateDishes } from '../dish-generator'
import type { Dish, Constraints } from '../../types'

describe('菜品生成算法', () => {
  const sampleDishes: Dish[] = [
    {
      id: '1',
      name: '白米饭',
      price: 3,
      type: '主食',
      temperature: '热',
      meatType: '素',
      tags: ['米饭', '主食'],
      baseQuantity: 1,
      scaleWithPeople: true
    },
    {
      id: '2',
      name: '红烧肉',
      price: 38,
      type: '主菜',
      temperature: '热',
      meatType: '荤',
      tags: ['猪肉', '红烧', '下饭'],
      baseQuantity: 1,
      scaleWithPeople: false
    },
    {
      id: '3',
      name: '麻婆豆腐',
      price: 22,
      type: '副菜',
      temperature: '热',
      meatType: '素',
      tags: ['豆腐', '川菜', '素食'],
      baseQuantity: 1,
      scaleWithPeople: false
    },
    {
      id: '4',
      name: '紫菜蛋花汤',
      price: 15,
      type: '汤',
      temperature: '热',
      meatType: '素',
      tags: ['紫菜', '鸡蛋', '汤品'],
      baseQuantity: 1,
      scaleWithPeople: true
    },
    {
      id: '5',
      name: '绿豆沙',
      price: 8,
      type: '点心',
      temperature: '冷',
      meatType: '素',
      tags: ['绿豆', '甜品', '消暑'],
      baseQuantity: 1,
      scaleWithPeople: false
    }
  ]

  const basicConstraints: Constraints = {
    headcount: 4,
    budget: 200,
    typeDistribution: {
      '主食': 1,
      '主菜': 2,
      '副菜': 1,
      '汤': 1,
      '点心': 0
    },
    temperatureDistribution: {},
    meatDistribution: {},
    tagRequirements: {},
    excludedTags: []
  }

  it('应该返回生成结果对象', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    expect(result).toHaveProperty('dishes')
    expect(result).toHaveProperty('totalCost')
    expect(result).toHaveProperty('metadata')
    expect(Array.isArray(result.dishes)).toBe(true)
  })

  it('应该生成指定类型数量的菜品', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    const typeCount = result.dishes.reduce((acc, { dish }) => {
      acc[dish.type] = (acc[dish.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    expect(typeCount['主食']).toBe(1)
    expect(typeCount['主菜']).toBe(1) // 只有一个主菜可选
    expect(typeCount['副菜']).toBe(1)
    expect(typeCount['汤']).toBe(1)
    expect(typeCount['点心'] || 0).toBe(0)
  })

  it('应该在预算范围内', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    expect(result.totalCost).toBeLessThanOrEqual(basicConstraints.budget)
    expect(result.totalCost).toBeGreaterThan(0)
  })

  it('应该正确计算总价格', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    const calculatedTotal = result.dishes.reduce((sum, { dish, quantity }) => {
      const price = dish.scaleWithPeople ? dish.price * basicConstraints.headcount : dish.price
      return sum + (price * quantity)
    }, 0)
    
    expect(result.totalCost).toBe(calculatedTotal)
  })

  it('应该包含生成元数据', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    expect(result.metadata).toHaveProperty('generationTime')
    expect(result.metadata).toHaveProperty('algorithmVersion')
    expect(result.metadata).toHaveProperty('satisfiedConstraints')
    expect(result.metadata).toHaveProperty('warnings')
    
    expect(typeof result.metadata.generationTime).toBe('number')
    expect(result.metadata.generationTime).toBeGreaterThanOrEqual(0)
  })

  it('应该在预算不足时返回警告', () => {
    const lowBudgetConstraints: Constraints = {
      ...basicConstraints,
      budget: 10 // 很低的预算
    }
    
    const result = generateDishes(sampleDishes, lowBudgetConstraints)
    
    expect(result.metadata.warnings).toContain('预算可能不足，无法满足所有约束')
  })

  it('应该在没有足够菜品时返回警告', () => {
    const highDemandConstraints: Constraints = {
      ...basicConstraints,
      typeDistribution: {
        '主食': 5, // 要求5个主食，但只有1个可选
        '主菜': 1,
        '副菜': 1,
        '汤': 1,
        '点心': 1
      }
    }
    
    const result = generateDishes(sampleDishes, highDemandConstraints)
    
    expect(result.metadata.warnings.length).toBeGreaterThan(0)
  })

  it('应该考虑排除标签', () => {
    const constraintsWithExclusions: Constraints = {
      ...basicConstraints,
      excludedTags: ['猪肉'] // 排除猪肉
    }
    
    const result = generateDishes(sampleDishes, constraintsWithExclusions)
    
    // 确保没有选择包含排除标签的菜品
    const hasExcludedTag = result.dishes.some(({ dish }) => 
      dish.tags.some(tag => constraintsWithExclusions.excludedTags.includes(tag))
    )
    
    expect(hasExcludedTag).toBe(false)
  })

  it('应该返回每道菜的数量和总价', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    result.dishes.forEach(({ dish, quantity, totalPrice }) => {
      expect(quantity).toBeGreaterThanOrEqual(dish.baseQuantity)
      
      const expectedPrice = dish.scaleWithPeople 
        ? dish.price * basicConstraints.headcount * quantity
        : dish.price * quantity
        
      expect(totalPrice).toBe(expectedPrice)
    })
  })
})