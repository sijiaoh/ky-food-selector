import type { Dish, Constraints, GenerationResult, ManualAdjustment } from '../types'

// 随机打乱数组的工具函数
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

// 为指定类型选择菜品的工具函数
const selectDishesForType = (availableForType: Dish[]) => {
  const sortedDishes = availableForType.sort((a, b) => a.price - b.price)
  const cheapCount = Math.ceil(sortedDishes.length / 3)
  const midCount = Math.ceil(sortedDishes.length / 3)
  
  const cheapDishes = sortedDishes.slice(0, cheapCount)
  const midDishes = sortedDishes.slice(cheapCount, cheapCount + midCount)
  const expensiveDishes = sortedDishes.slice(cheapCount + midCount)
  
  const shuffledCheap = shuffleArray(cheapDishes)
  const shuffledMid = shuffleArray(midDishes)
  const shuffledExpensive = shuffleArray(expensiveDishes)
  
  // 智能随机策略选择菜品
  const getRandomDish = (): Dish | undefined => {
    const rand = Math.random()
    if (rand < 0.7 && shuffledCheap.length > 0) {
      return shuffledCheap.shift()
    } else if (rand < 0.95 && shuffledMid.length > 0) {
      return shuffledMid.shift()
    } else if (shuffledExpensive.length > 0) {
      return shuffledExpensive.shift()
    } else if (shuffledMid.length > 0) {
      return shuffledMid.shift()
    } else if (shuffledCheap.length > 0) {
      return shuffledCheap.shift()
    }
    return undefined
  }
  
  return { getRandomDish, remainingDishes: [...shuffledCheap, ...shuffledMid, ...shuffledExpensive] }
}

export function generateDishes(
  availableDishes: Dish[], 
  constraints: Constraints
): GenerationResult {
  const startTime = Date.now()
  const selectedDishes: GenerationResult['dishes'] = []
  const warnings: string[] = []
  let totalCost = 0

  // 过滤掉排除标签的菜品
  const filteredDishes = availableDishes.filter(dish => 
    !dish.tags.some(tag => constraints.excludedTags.includes(tag))
  )

  // 按类型分组
  const dishesByType = filteredDishes.reduce((acc, dish) => {
    if (!acc[dish.type]) acc[dish.type] = []
    acc[dish.type].push(dish)
    return acc
  }, {} as Record<Dish['type'], Dish[]>)

  // 先处理用户明确指定数量的菜品类型
  for (const [type, requestedCount] of Object.entries(constraints.typeDistribution)) {
    if (requestedCount <= 0) continue

    const availableForType = dishesByType[type as Dish['type']] || []
    
    if (availableForType.length === 0) {
      warnings.push(`没有可用的${type}菜品`)
      continue
    }

    // 选择最多可选的菜品数量
    const actualCount = Math.min(requestedCount, availableForType.length)
    
    if (actualCount < requestedCount) {
      warnings.push(`${type}菜品数量不足，请求${requestedCount}个，仅能提供${actualCount}个`)
    }

    // 使用工具函数进行智能随机选择
    const { getRandomDish, remainingDishes } = selectDishesForType(availableForType)
    
    for (let i = 0; i < actualCount; i++) {
      const dish = getRandomDish()
      if (!dish) continue // 跳过undefined
      
      const quantity = dish.baseQuantity
      const dishPrice = dish.scaleWithPeople ? dish.price * constraints.headcount : dish.price
      const totalPrice = dishPrice * quantity

      // 检查预算
      if (totalCost + totalPrice > constraints.budget) {
        warnings.push('预算可能不足，无法满足所有约束')
        break
      }

      // 找到同类型的其他可选菜品作为替换选项
      const filteredRemaining = remainingDishes.filter(altDish => altDish.id !== dish.id)
      
      // 随机选择3个替换选项，确保多样性
      const alternatives = shuffleArray(filteredRemaining).slice(0, 3)

      const dishItem: GenerationResult['dishes'][0] = {
        dish,
        quantity,
        totalPrice,
        isFixed: false,
        canReplace: alternatives.length > 0
      }
      
      if (alternatives.length > 0) {
        dishItem.alternatives = alternatives
      }
      
      selectedDishes.push(dishItem)

      totalCost += totalPrice
    }
  }

  // 自动安排未指定数量的菜品类型
  const specifiedTypes = new Set(Object.keys(constraints.typeDistribution))
  const allTypes = Object.keys(dishesByType) as Dish['type'][]
  const unspecifiedTypes = allTypes.filter(type => !specifiedTypes.has(type))
  
  // 为未指定的类型自动安排菜品，但需要考虑剩余预算
  const remainingBudget = constraints.budget - totalCost
  if (remainingBudget > 0 && unspecifiedTypes.length > 0) {
    // 随机选择1-2个未指定的类型进行自动安排
    const typesToAdd = shuffleArray(unspecifiedTypes).slice(0, Math.min(2, unspecifiedTypes.length))
    
    for (const type of typesToAdd) {
      const availableForType = dishesByType[type] || []
      if (availableForType.length === 0) continue
      
      // 使用工具函数进行智能随机选择
      const { getRandomDish, remainingDishes } = selectDishesForType(availableForType)
      
      // 尝试自动添加1个该类型的菜品
      const dish = getRandomDish()
      if (!dish) continue
      
      const quantity = dish.baseQuantity
      const dishPrice = dish.scaleWithPeople ? dish.price * constraints.headcount : dish.price
      const totalPrice = dishPrice * quantity
      
      // 检查是否在剩余预算内
      if (totalCost + totalPrice <= constraints.budget) {
        const filteredRemaining = remainingDishes.filter(altDish => altDish.id !== dish.id)
        const alternatives = shuffleArray(filteredRemaining).slice(0, 3)
        
        const dishItem: GenerationResult['dishes'][0] = {
          dish,
          quantity,
          totalPrice,
          isFixed: false,
          canReplace: alternatives.length > 0
        }
        
        if (alternatives.length > 0) {
          dishItem.alternatives = alternatives
        }
        
        selectedDishes.push(dishItem)
        totalCost += totalPrice
        
        warnings.push(`自动添加了${type}：${dish.name}`)
      }
    }
  }

  const generationTime = Date.now() - startTime

  return {
    dishes: selectedDishes,
    totalCost,
    metadata: {
      generationTime,
      algorithmVersion: 'v1.2.0-auto',
      satisfiedConstraints: Object.keys(constraints.typeDistribution).filter(
        type => selectedDishes.some(item => item.dish.type === type)
      ),
      warnings
    }
  }
}

export function applyManualAdjustments(
  result: GenerationResult,
  adjustments: ManualAdjustment[],
  constraints: Constraints
): GenerationResult {
  const adjustedDishes = [...result.dishes]
  const warnings = [...result.metadata.warnings]

  for (const adjustment of adjustments) {
    const dishIndex = adjustedDishes.findIndex(item => item.dish.id === adjustment.dishId)
    
    if (dishIndex === -1) continue

    switch (adjustment.type) {
      case 'fix':
        adjustedDishes[dishIndex] = {
          ...adjustedDishes[dishIndex]!,
          isFixed: true
        }
        break
        
      case 'replace':
        if (adjustment.newDish) {
          const quantity = adjustedDishes[dishIndex]!.quantity
          const dishPrice = adjustment.newDish.scaleWithPeople 
            ? adjustment.newDish.price * constraints.headcount 
            : adjustment.newDish.price
          const totalPrice = dishPrice * quantity

          const newDishItem: GenerationResult['dishes'][0] = {
            dish: adjustment.newDish,
            quantity,
            totalPrice,
            isFixed: false,
            canReplace: true
          }
          
          if (adjustedDishes[dishIndex]!.alternatives) {
            newDishItem.alternatives = adjustedDishes[dishIndex]!.alternatives
          }
          
          adjustedDishes[dishIndex] = newDishItem
        }
        break
        
      case 'remove':
        const removedDish = adjustedDishes[dishIndex]!
        adjustedDishes.splice(dishIndex, 1)
        warnings.push(`已移除菜品: ${removedDish.dish.name}`)
        break
    }
  }

  // 重新计算总价
  const totalCost = adjustedDishes.reduce((sum, item) => sum + item.totalPrice, 0)

  return {
    dishes: adjustedDishes,
    totalCost,
    metadata: {
      ...result.metadata,
      warnings
    }
  }
}