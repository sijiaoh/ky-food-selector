import { describe, it, expect } from 'vitest'
import { generateDishes, applyManualAdjustments } from '../dish-generator'
import type { Dish, Constraints, ManualAdjustment } from '../../types'

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

  it('应该包含替换选项和操作标志', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    result.dishes.forEach(({ dish, canReplace, alternatives, isFixed }) => {
      expect(typeof canReplace).toBe('boolean')
      expect(typeof isFixed).toBe('boolean')
      expect(isFixed).toBe(false) // 默认不固定
      
      if (canReplace) {
        expect(Array.isArray(alternatives)).toBe(true)
        expect(alternatives!.length).toBeGreaterThan(0)
        // 确保替换选项不包含当前菜品
        expect(alternatives!.some(alt => alt.id === dish.id)).toBe(false)
      }
    })
  })

  it('应该具有随机性，多次生成结果不完全相同', () => {
    // 使用更大的菜品数据集来测试随机性
    const largeDishSet: Dish[] = [
      ...sampleDishes,
      {
        id: '6', name: '宫保鸡丁', price: 28, type: '主菜',
        temperature: '热', meatType: '荤', tags: ['鸡肉', '川菜'],
        baseQuantity: 1, scaleWithPeople: false
      },
      {
        id: '7', name: '鱼香肉丝', price: 25, type: '主菜',
        temperature: '热', meatType: '荤', tags: ['猪肉', '川菜'],
        baseQuantity: 1, scaleWithPeople: false
      },
      {
        id: '8', name: '清炒小白菜', price: 12, type: '副菜',
        temperature: '热', meatType: '素', tags: ['青菜', '清淡'],
        baseQuantity: 1, scaleWithPeople: false
      },
      {
        id: '9', name: '糖醋排骨', price: 35, type: '主菜',
        temperature: '热', meatType: '荤', tags: ['猪肉', '糖醋'],
        baseQuantity: 1, scaleWithPeople: false
      },
      {
        id: '10', name: '青椒土豆丝', price: 8, type: '副菜',
        temperature: '热', meatType: '素', tags: ['土豆', '青椒'],
        baseQuantity: 1, scaleWithPeople: false
      }
    ]

    const multiChoiceConstraints: Constraints = {
      ...basicConstraints,
      typeDistribution: {
        '主食': 1,
        '主菜': 2, // 要求2个主菜，有多个选择
        '副菜': 2, // 要求2个副菜，有多个选择
        '汤': 1,
        '点心': 0
      }
    }

    // 生成20次结果来更好地测试随机性
    const results = Array.from({ length: 20 }, () => 
      generateDishes(largeDishSet, multiChoiceConstraints)
    )

    // 提取所有选中的菜品组合
    const dishCombinations = results.map(result => 
      result.dishes
        .map(item => item.dish.name)
        .sort() // 排序以便比较
        .join('|')
    )

    // 统计不同组合的数量
    const uniqueCombinations = new Set(dishCombinations)
    
    // 随机性验证：至少应该有3种不同的组合
    expect(uniqueCombinations.size).toBeGreaterThanOrEqual(3)
    
    // 打印统计信息（仅在测试失败时显示）
    if (uniqueCombinations.size < 3) {
      console.log('随机性测试统计:')
      console.log('总生成次数:', results.length)
      console.log('不同组合数:', uniqueCombinations.size)
      console.log('组合详情:', Array.from(uniqueCombinations))
    }
  })

  it('应该遵循价格分档策略（便宜菜优先，适度随机）', () => {
    // 创建明显价格分档的菜品集
    const tieredDishes: Dish[] = [
      // 便宜档 (5-10元)
      { id: '1', name: '便宜菜A', price: 5, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '2', name: '便宜菜B', price: 8, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '3', name: '便宜菜C', price: 10, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      
      // 中档 (20-30元)
      { id: '4', name: '中档菜A', price: 20, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '5', name: '中档菜B', price: 25, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '6', name: '中档菜C', price: 30, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      
      // 昂贵档 (50-60元)
      { id: '7', name: '昂贵菜A', price: 50, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '8', name: '昂贵菜B', price: 55, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '9', name: '昂贵菜C', price: 60, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false }
    ]

    const strategyConstraints: Constraints = {
      headcount: 4,
      budget: 300, // 充足预算
      typeDistribution: { '主菜': 5 }, // 要求5个主菜
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }

    // 生成50次结果进行统计分析
    const results = Array.from({ length: 50 }, () => 
      generateDishes(tieredDishes, strategyConstraints)
    )

    // 统计各价格档菜品的选中频率
    let cheapCount = 0
    let midCount = 0
    let expensiveCount = 0
    let totalDishes = 0

    results.forEach(result => {
      result.dishes.forEach(item => {
        totalDishes++
        const price = item.dish.price
        if (price <= 10) cheapCount++
        else if (price <= 30) midCount++
        else expensiveCount++
      })
    })

    const cheapRatio = cheapCount / totalDishes
    const midRatio = midCount / totalDishes
    const expensiveRatio = expensiveCount / totalDishes

    // 验证价格策略：便宜菜应该占大部分（至少50%），昂贵菜应该很少（不超过20%）
    expect(cheapRatio).toBeGreaterThan(0.5) // 便宜菜 > 50%
    expect(expensiveRatio).toBeLessThan(0.2) // 昂贵菜 < 20%
    
    // 确保有一定的多样性（不是100%都选便宜菜）
    expect(midRatio + expensiveRatio).toBeGreaterThan(0.1) // 中高档菜至少10%
  })
})

describe('手动调整功能', () => {
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
      name: '糖醋里脊',
      price: 42,
      type: '主菜',
      temperature: '热',
      meatType: '荤',
      tags: ['猪肉', '糖醋', '酸甜'],
      baseQuantity: 1,
      scaleWithPeople: false
    }
  ]

  const basicConstraints: Constraints = {
    headcount: 4,
    budget: 200,
    typeDistribution: {
      '主食': 1,
      '主菜': 1,
      '副菜': 0,
      '汤': 0,
      '点心': 0
    },
    temperatureDistribution: {},
    meatDistribution: {},
    tagRequirements: {},
    excludedTags: []
  }

  it('应该能固定菜品', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    const dishToFix = result.dishes[0]!
    
    const adjustments: ManualAdjustment[] = [
      { type: 'fix', dishId: dishToFix.dish.id }
    ]
    
    const adjustedResult = applyManualAdjustments(result, adjustments, basicConstraints)
    const fixedDish = adjustedResult.dishes.find(item => item.dish.id === dishToFix.dish.id)
    
    expect(fixedDish?.isFixed).toBe(true)
  })

  it('应该能替换菜品', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    const dishToReplace = result.dishes.find(item => item.dish.type === '主菜')
    const replacementDish = sampleDishes.find(dish => 
      dish.type === '主菜' && dish.id !== dishToReplace?.dish.id
    )
    
    if (!dishToReplace || !replacementDish) {
      throw new Error('测试数据设置错误')
    }
    
    const adjustments: ManualAdjustment[] = [
      { type: 'replace', dishId: dishToReplace.dish.id, newDish: replacementDish }
    ]
    
    const adjustedResult = applyManualAdjustments(result, adjustments, basicConstraints)
    const replacedDish = adjustedResult.dishes.find(item => 
      item.dish.id === replacementDish.id
    )
    
    expect(replacedDish).toBeDefined()
    expect(replacedDish?.dish.name).toBe(replacementDish.name)
  })

  it('应该能移除菜品', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    const originalLength = result.dishes.length
    const dishToRemove = result.dishes[0]!
    
    const adjustments: ManualAdjustment[] = [
      { type: 'remove', dishId: dishToRemove.dish.id }
    ]
    
    const adjustedResult = applyManualAdjustments(result, adjustments, basicConstraints)
    
    expect(adjustedResult.dishes.length).toBe(originalLength - 1)
    expect(adjustedResult.dishes.some(item => 
      item.dish.id === dishToRemove.dish.id
    )).toBe(false)
  })

  it('应该正确重新计算总价', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    const dishToReplace = result.dishes[0]!
    const moreExpensiveDish = sampleDishes.find(dish => 
      dish.price > dishToReplace.dish.price && dish.type === dishToReplace.dish.type
    )
    
    if (!moreExpensiveDish) {
      // 如果没有更贵的菜品，跳过这个测试
      return
    }
    
    const adjustments: ManualAdjustment[] = [
      { type: 'replace', dishId: dishToReplace.dish.id, newDish: moreExpensiveDish }
    ]
    
    const adjustedResult = applyManualAdjustments(result, adjustments, basicConstraints)
    
    const calculatedTotal = adjustedResult.dishes.reduce((sum, { totalPrice }) => 
      sum + totalPrice, 0
    )
    
    expect(adjustedResult.totalCost).toBe(calculatedTotal)
    expect(adjustedResult.totalCost).toBeGreaterThan(result.totalCost)
  })

  it('应该处理无效的调整操作', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    const adjustments: ManualAdjustment[] = [
      { type: 'fix', dishId: 'nonexistent-id' },
      { type: 'replace', dishId: 'another-nonexistent-id', newDish: sampleDishes[0]! }
    ]
    
    // 不应该抛出错误
    expect(() => {
      applyManualAdjustments(result, adjustments, basicConstraints)
    }).not.toThrow()
  })
})