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

  // 智能预算优化：尽量使用90-100%的预算
  const targetBudget = constraints.budget * 0.9 // 目标预算：90%
  const maxBudget = constraints.budget // 最大预算：100%
  
  // 如果当前花费不足目标预算，继续添加菜品
  if (totalCost < targetBudget) {
    const specifiedTypes = new Set(Object.keys(constraints.typeDistribution))
    const allTypes = Object.keys(dishesByType) as Dish['type'][]
    const unspecifiedTypes = allTypes.filter(type => !specifiedTypes.has(type))
    
    // 创建候选菜品池：包括未指定类型的菜品 + 已指定类型的额外菜品
    const candidatePool: Array<{ dish: Dish; type: Dish['type']; isExtra: boolean }> = []
    
    // 添加未指定类型的菜品
    unspecifiedTypes.forEach(type => {
      const dishes = dishesByType[type] || []
      dishes.forEach(dish => {
        candidatePool.push({ dish, type, isExtra: false })
      })
    })
    
    // 添加已指定类型的额外菜品（可以超出用户指定的数量）
    Object.keys(constraints.typeDistribution).forEach(type => {
      const dishes = dishesByType[type as Dish['type']] || []
      const alreadySelected = selectedDishes.filter(item => item.dish.type === type).map(item => item.dish.id)
      dishes
        .filter(dish => !alreadySelected.includes(dish.id))
        .forEach(dish => {
          candidatePool.push({ dish, type: type as Dish['type'], isExtra: true })
        })
    })
    
    // 按价格排序候选菜品
    candidatePool.sort((a, b) => {
      const priceA = a.dish.scaleWithPeople ? a.dish.price * constraints.headcount : a.dish.price
      const priceB = b.dish.scaleWithPeople ? b.dish.price * constraints.headcount : b.dish.price
      return priceA - priceB
    })
    
    // 使用贪心算法填充预算：优先选择能让总价最接近目标的菜品
    while (totalCost < targetBudget && candidatePool.length > 0) {
      let bestCandidate: typeof candidatePool[0] | null = null
      let bestScore = -1
      
      // 寻找最佳候选菜品（让总价最接近目标预算的菜品）
      for (let i = 0; i < candidatePool.length; i++) {
        const candidate = candidatePool[i]!
        const dishPrice = candidate.dish.scaleWithPeople 
          ? candidate.dish.price * constraints.headcount 
          : candidate.dish.price
        const newTotalCost = totalCost + dishPrice
        
        // 不能超过最大预算
        if (newTotalCost > maxBudget) continue
        
        // 计算得分：越接近目标预算得分越高
        const distanceToTarget = Math.abs(targetBudget - newTotalCost)
        const score = 1000 - distanceToTarget // 距离越小得分越高
        
        if (score > bestScore) {
          bestScore = score
          bestCandidate = candidate
        }
      }
      
      // 如果找到了合适的候选菜品，添加它
      if (bestCandidate) {
        const dish = bestCandidate.dish
        const quantity = dish.baseQuantity
        const dishPrice = dish.scaleWithPeople ? dish.price * constraints.headcount : dish.price
        const totalPrice = dishPrice * quantity
        
        // 获取同类型菜品作为替换选项
        const sameTypeDishes = dishesByType[dish.type] || []
        const alternatives = shuffleArray(
          sameTypeDishes.filter(altDish => altDish.id !== dish.id)
        ).slice(0, 3)
        
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
        
        // 添加说明信息
        if (bestCandidate.isExtra) {
          warnings.push(`为更好利用预算，额外添加了${dish.type}：${dish.name}`)
        } else {
          warnings.push(`自动添加了${dish.type}：${dish.name}`)
        }
        
        // 从候选池中移除这个菜品
        const index = candidatePool.findIndex(c => c.dish.id === dish.id)
        if (index !== -1) {
          candidatePool.splice(index, 1)
        }
      } else {
        // 如果没有合适的候选菜品，退出循环
        break
      }
    }
  }
  
  // 计算预算利用率并添加相关信息
  const budgetUtilization = (totalCost / constraints.budget) * 100
  if (budgetUtilization < 85) {
    warnings.push(`预算利用率较低(${budgetUtilization.toFixed(1)}%)，建议增加菜品数量或预算`)
  } else if (budgetUtilization >= 90) {
    warnings.push(`预算利用率良好(${budgetUtilization.toFixed(1)}%)`)
  }

  const generationTime = Date.now() - startTime

  return {
    dishes: selectedDishes,
    totalCost,
    metadata: {
      generationTime,
      algorithmVersion: 'v1.3.0-budget',
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