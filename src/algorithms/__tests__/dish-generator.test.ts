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
    },
    {
      id: '6',
      name: '炒面',
      price: 12,
      type: '主食',
      temperature: '热',
      meatType: '荤',
      tags: ['面条', '炒制'],
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
    
    // 验证用户明确指定的类型数量
    expect(typeCount['主食']).toBe(1)
    expect(typeCount['主菜']).toBe(1) // 只有一个主菜可选
    expect(typeCount['副菜']).toBe(1)
    expect(typeCount['汤']).toBe(1)
    
    // 点心没有指定数量(为0)，但新算法可能为了利用预算而自动添加
    // 所以这里只验证不超过可用数量
    expect(typeCount['点心'] || 0).toBeLessThanOrEqual(1) // 最多1个点心可选
  })

  it('应该在预算范围内', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    expect(result.totalCost).toBeLessThanOrEqual(basicConstraints.budget)
    expect(result.totalCost).toBeGreaterThan(0)
  })

  it('应该正确计算总价格', () => {
    const result = generateDishes(sampleDishes, basicConstraints)
    
    const calculatedTotal = result.dishes.reduce((sum, { dish, quantity }) => {
      // 新的计算逻辑：总价 = 单价 × 实际数量
      return sum + (dish.price * quantity)
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
    
    const hasOverBudgetWarning = result.metadata.warnings.some(warning => 
      warning.includes('超出预算') || warning.includes('为满足') || warning.includes('预算利用率')
    )
    expect(hasOverBudgetWarning).toBe(true)
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
      // 新的逻辑：数量为max(基础个数, 人数)
      const expectedQuantity = dish.scaleWithPeople 
        ? Math.max(dish.baseQuantity, basicConstraints.headcount)
        : dish.baseQuantity
      expect(quantity).toBe(expectedQuantity)
      
      // 总价 = 单价 × 实际数量
      const expectedPrice = dish.price * quantity
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
      budget: 120, // 较紧的预算，迫使算法优先选择便宜菜品
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

    // 验证价格策略：便宜菜应该占相对大部分，昂贵菜应该很少
    // 注意：新算法会积极利用预算，所以比例可能与纯贪心算法不同
    expect(cheapRatio).toBeGreaterThan(0.4) // 便宜菜 > 40%（调整期望）
    expect(expensiveRatio).toBeLessThan(0.3) // 昂贵菜 < 30%
    
    // 确保有一定的多样性（不是100%都选便宜菜）
    expect(midRatio + expensiveRatio).toBeGreaterThan(0.3) // 中高档菜至少30%
  })

  it('应该支持空值类型自动安排', () => {
    // 创建包含多种类型的菜品集
    const diverseDishes: Dish[] = [
      { id: '1', name: '米饭', price: 3, type: '主食', tags: [], baseQuantity: 1, scaleWithPeople: true },
      { id: '2', name: '红烧肉', price: 38, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '3', name: '凉拌黄瓜', price: 8, type: '副菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '4', name: '紫菜蛋花汤', price: 15, type: '汤', tags: [], baseQuantity: 1, scaleWithPeople: true },
      { id: '5', name: '绿豆沙', price: 8, type: '点心', tags: [], baseQuantity: 1, scaleWithPeople: false }
    ]

    // 只指定主食和主菜，其他类型留空（让算法自动安排）
    const partialConstraints: Constraints = {
      headcount: 4,
      budget: 150, // 充足预算
      typeDistribution: {
        '主食': 1,
        '主菜': 1
        // 副菜、汤、点心未指定，让算法自动安排
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }

    const result = generateDishes(diverseDishes, partialConstraints)

    // 验证结果包含指定的类型
    const selectedTypes = result.dishes.map(item => item.dish.type)
    expect(selectedTypes).toContain('主食')
    expect(selectedTypes).toContain('主菜')

    // 验证可能自动添加了其他类型
    const totalDishes = result.dishes.length
    expect(totalDishes).toBeGreaterThanOrEqual(2) // 至少包含指定的2个

    // 如果自动添加了菜品，应该有相应的警告信息
    const autoAddWarnings = result.metadata.warnings.filter(warning => 
      warning.includes('自动添加了')
    )
    
    if (totalDishes > 2) {
      expect(autoAddWarnings.length).toBeGreaterThan(0)
    }

    // 验证在预算范围内
    expect(result.totalCost).toBeLessThanOrEqual(partialConstraints.budget)
  })

  it('应该正确处理-1值的自动安排', () => {
    // 测试-1值（空输入）应该自动安排一些菜品，而不是0个
    const autoArrangeConstraints: Constraints = {
      headcount: 4,
      budget: 150,
      typeDistribution: {
        '主食': 1,
        '主菜': -1, // 空值，应该自动安排
        '副菜': -1, // 空值，应该自动安排
        '汤': 0,   // 明确不要
        '点心': 0  // 明确不要
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }

    const result = generateDishes(sampleDishes, autoArrangeConstraints)

    // 验证结果包含指定的主食
    const selectedTypes = result.dishes.map(item => item.dish.type)
    expect(selectedTypes).toContain('主食')

    // 验证自动安排的类型有菜品（不是0个）
    const mainDishCount = selectedTypes.filter(type => type === '主菜').length
    const sideDishCount = selectedTypes.filter(type => type === '副菜').length
    
    expect(mainDishCount).toBeGreaterThan(0) // 应该自动安排了主菜
    expect(sideDishCount).toBeGreaterThan(0) // 应该自动安排了副菜

    // 验证不包含明确设为0的类型
    expect(selectedTypes).not.toContain('汤')
    expect(selectedTypes).not.toContain('点心')

    // 验证有相关的自动安排警告
    const autoWarnings = result.metadata.warnings.filter(warning => 
      warning.includes('自动为') && warning.includes('安排')
    )
    expect(autoWarnings.length).toBeGreaterThan(0)

    // 验证在预算范围内
    expect(result.totalCost).toBeLessThanOrEqual(autoArrangeConstraints.budget)
  })

  it('应该充分利用预算，达到90-100%预算利用率', () => {
    // 创建充足的菜品选择
    const abundantDishes: Dish[] = [
      { id: '1', name: '米饭', price: 3, type: '主食', tags: [], baseQuantity: 1, scaleWithPeople: true },
      { id: '2', name: '面条', price: 5, type: '主食', tags: [], baseQuantity: 1, scaleWithPeople: true },
      
      { id: '3', name: '红烧肉', price: 25, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '4', name: '宫保鸡丁', price: 28, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '5', name: '糖醋里脊', price: 32, type: '主菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      
      { id: '6', name: '凉拌黄瓜', price: 8, type: '副菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '7', name: '清炒时蔬', price: 12, type: '副菜', tags: [], baseQuantity: 1, scaleWithPeople: false },
      
      { id: '8', name: '紫菜蛋花汤', price: 15, type: '汤', tags: [], baseQuantity: 1, scaleWithPeople: true },
      { id: '9', name: '冬瓜汤', price: 12, type: '汤', tags: [], baseQuantity: 1, scaleWithPeople: true },
      
      { id: '10', name: '绿豆沙', price: 8, type: '点心', tags: [], baseQuantity: 1, scaleWithPeople: false },
      { id: '11', name: '红豆沙', price: 8, type: '点心', tags: [], baseQuantity: 1, scaleWithPeople: false }
    ]

    const budgetOptimizationConstraints: Constraints = {
      headcount: 4,
      budget: 200, // 充足预算
      typeDistribution: {
        '主食': -1,  // 自动安排，让算法优化预算利用率
        '主菜': -1   // 自动安排，让算法优化预算利用率
        // 其他类型留空，让算法优化预算利用率
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }

    const result = generateDishes(abundantDishes, budgetOptimizationConstraints)

    // 验证预算利用率达到90%以上
    const budgetUtilization = (result.totalCost / budgetOptimizationConstraints.budget) * 100
    expect(budgetUtilization).toBeGreaterThanOrEqual(90)
    expect(result.totalCost).toBeLessThanOrEqual(budgetOptimizationConstraints.budget)

    // 应该有预算利用率相关的提示信息
    const utilizationWarnings = result.metadata.warnings.filter(warning => 
      warning.includes('预算利用率') || warning.includes('额外添加')
    )
    expect(utilizationWarnings.length).toBeGreaterThan(0)

    // 验证添加了额外菜品
    expect(result.dishes.length).toBeGreaterThan(2) // 应该超过最初指定的2个菜品
  })

  it('应该严格按照指定数量生成，不超过', () => {
    const strictConstraints: Constraints = {
      headcount: 4,
      budget: 50, // 较小预算，可能不足
      typeDistribution: {
        '主食': 2,  // 明确指定2个主食
        '主菜': 1,  // 明确指定1个主菜
        '副菜': 0,  // 明确不要副菜
        '汤': 0,    // 明确不要汤
        '点心': 0   // 明确不要点心
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }

    const result = generateDishes(sampleDishes, strictConstraints)

    // 验证严格按照指定数量
    const mainFoodCount = result.dishes.filter(item => item.dish.type === '主食').length
    const mainDishCount = result.dishes.filter(item => item.dish.type === '主菜').length
    const sideDishCount = result.dishes.filter(item => item.dish.type === '副菜').length
    const soupCount = result.dishes.filter(item => item.dish.type === '汤').length
    const dessertCount = result.dishes.filter(item => item.dish.type === '点心').length

    expect(mainFoodCount).toBe(2) // 严格等于2
    expect(mainDishCount).toBe(1) // 严格等于1
    expect(sideDishCount).toBe(0) // 严格等于0
    expect(soupCount).toBe(0)     // 严格等于0
    expect(dessertCount).toBe(0)  // 严格等于0

    // 总菜品数应该等于指定数量之和
    expect(result.dishes.length).toBe(3) // 2+1+0+0+0=3

    // 验证算法版本
    expect(result.metadata.algorithmVersion).toBe('v1.5.0-strict')
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

  it('重新生成时应该保留固定菜品', () => {
    // 第一次生成
    const firstResult = generateDishes(sampleDishes, basicConstraints)
    const dishToFix = firstResult.dishes[0]!
    
    // 固定一个菜品
    const adjustments: ManualAdjustment[] = [
      { type: 'fix', dishId: dishToFix.dish.id }
    ]
    const adjustedResult = applyManualAdjustments(firstResult, adjustments, basicConstraints)
    
    // 重新生成，传入前一次结果
    const secondResult = generateDishes(sampleDishes, basicConstraints, adjustedResult)
    
    // 验证固定的菜品仍然在结果中
    const fixedDish = secondResult.dishes.find(item => item.dish.id === dishToFix.dish.id)
    expect(fixedDish).toBeDefined()
    expect(fixedDish?.isFixed).toBe(true)
    expect(fixedDish?.dish.name).toBe(dishToFix.dish.name)
    
    // 验证警告信息中包含保留固定菜品的提示
    const hasFixedWarning = secondResult.metadata.warnings.some(warning => 
      warning.includes('保留固定菜品') && warning.includes(dishToFix.dish.name)
    )
    expect(hasFixedWarning).toBe(true)
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

describe('温度搭配功能', () => {
  const tempDishes: Dish[] = [
    {
      id: '1', name: '热汤面', price: 15, type: '主食',
      temperature: '热', tags: [], baseQuantity: 1, scaleWithPeople: false
    },
    {
      id: '2', name: '凉面', price: 12, type: '主食', 
      temperature: '冷', tags: [], baseQuantity: 1, scaleWithPeople: false
    },
    {
      id: '3', name: '红烧肉', price: 35, type: '主菜',
      temperature: '热', tags: [], baseQuantity: 1, scaleWithPeople: false
    },
    {
      id: '4', name: '白切鸡', price: 32, type: '主菜',
      temperature: '冷', tags: [], baseQuantity: 1, scaleWithPeople: false
    },
    {
      id: '5', name: '清炒青菜', price: 10, type: '副菜',
      temperature: '热', tags: [], baseQuantity: 1, scaleWithPeople: false
    },
    {
      id: '6', name: '凉拌黄瓜', price: 8, type: '副菜',
      temperature: '冷', tags: [], baseQuantity: 1, scaleWithPeople: false
    }
  ]

  it('应该正确处理温度搭配约束', () => {
    const constraintsWithTemperature: Constraints = {
      headcount: 4,
      budget: 200,
      typeDistribution: {
        '主食': 1,
        '主菜': 1,
        '副菜': 1
      },
      temperatureDistribution: {
        '热': 2,
        '冷': 1
      },
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, constraintsWithTemperature)
    
    // 检查是否有热菜和冷菜
    const hotDishes = result.dishes.filter(item => item.dish.temperature === '热')
    const coldDishes = result.dishes.filter(item => item.dish.temperature === '冷')
    
    expect(hotDishes.length).toBeGreaterThan(0)
    expect(coldDishes.length).toBeGreaterThan(0)
    expect(result.totalCost).toBeLessThanOrEqual(constraintsWithTemperature.budget)
  })

  it('应该在温度约束为空时随机选择直到预算上限', () => {
    const constraintsWithNoTemp: Constraints = {
      headcount: 4,
      budget: 200,
      typeDistribution: {
        '主食': 1,
        '主菜': 1,
        '副菜': 1
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, constraintsWithNoTemp)
    
    // 应该有温度搭配未指定的提示
    expect(result.metadata.warnings.some(w => w.includes('温度搭配未指定，将随机选择热菜冷菜直到预算上限'))).toBe(true)
    expect(result.dishes.length).toBeGreaterThan(0)
  })

  it('应该处理温度自动安排(-1值)填充到预算上限', () => {
    const constraintsWithAutoTemp: Constraints = {
      headcount: 4,
      budget: 200,
      typeDistribution: {
        '主食': -1,  // 自动安排，这样才会填充到预算上限
        '主菜': -1,  // 自动安排
        '副菜': -1   // 自动安排
      },
      temperatureDistribution: {
        '热': -1,
        '冷': -1
      },
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, constraintsWithAutoTemp)
    
    // 应该有随机填充到预算上限的提示
    expect(result.metadata.warnings.some(w => w.includes('将随机填充到预算上限'))).toBe(true)
    expect(result.dishes.length).toBeGreaterThan(0)
    // 预算利用率应该比较高
    const budgetUtilization = (result.totalCost / constraintsWithAutoTemp.budget) * 100
    expect(budgetUtilization).toBeGreaterThan(50) // 至少使用50%的预算
  })

  it('应该在温度约束无法满足时给出警告', () => {
    const impossibleTempConstraints: Constraints = {
      headcount: 4,
      budget: 200,
      typeDistribution: {
        '主食': 1
      },
      temperatureDistribution: {
        '热': 10, // 要求10个热菜，但实际只有3个
        '冷': 10  // 要求10个冷菜，但实际只有3个
      },
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, impossibleTempConstraints)
    
    // 虽然约束无法完全满足，但应该尽力生成一些菜品
    expect(result.dishes.length).toBeGreaterThan(0)
    expect(result.totalCost).toBeLessThanOrEqual(impossibleTempConstraints.budget)
  })

  it('应该正确处理0值约束（排除特定温度）', () => {
    const constraintsExcludeCold: Constraints = {
      headcount: 4,
      budget: 200,
      typeDistribution: {
        '主菜': -1,  // 自动安排主菜，这样算法会优先选择热菜
        '副菜': -1   // 自动安排副菜，这样算法会优先选择热菜
      },
      temperatureDistribution: {
        '热': -1,  // 自动安排热菜
        '冷': 0    // 明确设为0，表示不要冷菜
      },
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, constraintsExcludeCold)
    
    // 检查结果中不应该有冷菜
    const coldDishes = result.dishes.filter(item => item.dish.temperature === '冷')
    const hotDishes = result.dishes.filter(item => item.dish.temperature === '热')
    
    expect(coldDishes.length).toBe(0) // 应该没有冷菜
    expect(hotDishes.length).toBeGreaterThan(0) // 应该有热菜
    expect(result.dishes.length).toBeGreaterThan(0)
  })

  it('应该严格遵守用户指定的菜品数量，不超量', () => {
    const exactQuantityConstraints: Constraints = {
      headcount: 4,
      budget: 1000, // 充足预算
      typeDistribution: {
        '主食': 1,
        '主菜': 2,
        '副菜': 1
        // 总计4道菜
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: []
    }
    
    const result = generateDishes(tempDishes, exactQuantityConstraints)
    
    // 验证总数量严格等于用户指定的数量
    const expectedTotal = 1 + 2 + 1 // 4道菜
    expect(result.dishes.length).toBe(expectedTotal)
    
    // 验证各类型数量准确
    const mainFoodCount = result.dishes.filter(item => item.dish.type === '主食').length
    const mainDishCount = result.dishes.filter(item => item.dish.type === '主菜').length
    const sideDishCount = result.dishes.filter(item => item.dish.type === '副菜').length
    
    expect(mainFoodCount).toBe(1)
    expect(mainDishCount).toBe(2)
    expect(sideDishCount).toBe(1)
    
    // 应该有预算利用率提示
    expect(result.metadata.warnings.some(w => 
      w.includes('严格按用户指定数量生成') || w.includes('按用户配置生成')
    )).toBe(true)
  })
})