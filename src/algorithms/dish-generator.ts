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

// 为指定类型选择菜品的工具函数，支持温度过滤
const selectDishesForType = (availableForType: Dish[], temperatureFilter?: string) => {
  // 如果指定了温度过滤，先按温度过滤
  let filteredDishes = availableForType
  if (temperatureFilter) {
    filteredDishes = availableForType.filter(dish => {
      const dishTemp = dish.temperature || '无'
      return dishTemp === temperatureFilter
    })
  }
  
  const sortedDishes = filteredDishes.sort((a, b) => a.price - b.price)
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

  // 按温度分组
  const dishesByTemperature = filteredDishes.reduce((acc, dish) => {
    const temp = dish.temperature || '无'
    if (!acc[temp]) acc[temp] = []
    acc[temp].push(dish)
    return acc
  }, {} as Record<string, Dish[]>)

  // 处理温度约束，创建温度分配池
  const temperaturePool: Record<string, number> = {}
  let hasTemperatureConstraints = false
  
  // 检查是否有温度约束
  for (const [temperature, count] of Object.entries(constraints.temperatureDistribution)) {
    if (count !== undefined) {
      if (count === 0) {
        // 明确设为0表示不要这种温度
        hasTemperatureConstraints = true
        // 不添加到temperaturePool，相当于排除这种温度
        continue
      } else if (count === -1) {
        // 自动安排：不设置上限，随机填充到预算上限
        hasTemperatureConstraints = true
        const availableCount = (dishesByTemperature[temperature] || []).length
        temperaturePool[temperature] = availableCount // 使用所有可用菜品，让预算来控制
        warnings.push(`自动为${temperature}菜安排，将随机填充到预算上限`)
      } else if (count > 0) {
        // 明确指定数量
        hasTemperatureConstraints = true
        temperaturePool[temperature] = count
      }
    }
  }
  
  // 如果没有温度约束且热菜冷菜都为空，不设置温度限制，让预算控制
  if (!hasTemperatureConstraints) {
    warnings.push(`温度搭配未指定，将随机选择热菜冷菜直到预算上限`)
  }

  // 先处理用户明确指定数量的菜品类型
  for (const [type, requestedCount] of Object.entries(constraints.typeDistribution)) {
    if (requestedCount < 0 && requestedCount !== -1) continue // 负数但不是-1的跳过
    if (requestedCount === 0) continue // 明确设为0的跳过

    const availableForType = dishesByType[type as Dish['type']] || []
    
    if (availableForType.length === 0) {
      warnings.push(`没有可用的${type}菜品`)
      continue
    }

    // 处理自动安排(-1)的情况
    let actualCount: number
    if (requestedCount === -1) {
      // 自动安排：不设置上限，使用所有可用菜品，让预算来控制
      actualCount = availableForType.length
      warnings.push(`自动为${type}安排，将随机填充到预算上限`)
    } else {
      // 用户明确指定数量
      actualCount = Math.min(requestedCount, availableForType.length)
      
      if (actualCount < requestedCount) {
        warnings.push(`${type}菜品数量不足，请求${requestedCount}个，仅能提供${actualCount}个`)
      }
    }

    // 根据温度约束选择菜品
    const selectedInThisType: Dish[] = []
    
    // 如果是自动安排(-1)，则逐个添加菜品直到预算不足
    if (requestedCount === -1) {
      // 过滤掉被排除的温度菜品
      let filteredForType = availableForType
      if (hasTemperatureConstraints) {
        filteredForType = availableForType.filter(dish => {
          const dishTemp = dish.temperature || '无'
          // 检查是否在约束中被明确设为0
          const tempConstraint = constraints.temperatureDistribution[dishTemp as NonNullable<Dish['temperature']>]
          return tempConstraint !== 0 // 不等于0的都可以选择
        })
      }
      
      const { getRandomDish } = selectDishesForType(filteredForType)
      
      // 持续添加菜品直到预算不足
      while (true) {
        const dish = getRandomDish()
        if (!dish) break // 没有更多菜品了
        
        const quantity = dish.scaleWithPeople ? dish.baseQuantity * constraints.headcount : dish.baseQuantity
        const dishTotalPrice = dish.price * quantity
        
        // 检查预算是否足够
        if (totalCost + dishTotalPrice > constraints.budget) {
          break // 预算不足，停止添加
        }
        
        selectedInThisType.push(dish)
        totalCost += dishTotalPrice
      }
    } else {
      // 用户指定数量时，按温度约束选择
      if (hasTemperatureConstraints || Object.keys(temperaturePool).length > 0) {
        const remainingForType = [...availableForType]
        
        // 按温度优先级选择
        for (const [temperature, neededCount] of Object.entries(temperaturePool)) {
          if (neededCount <= 0) continue
          if (selectedInThisType.length >= actualCount) break
          
          const { getRandomDish } = selectDishesForType(remainingForType, temperature)
          
          const maxFromThisTemp = Math.min(
            neededCount, 
            actualCount - selectedInThisType.length,
            remainingForType.filter(d => (d.temperature || '无') === temperature).length
          )
          
          for (let j = 0; j < maxFromThisTemp; j++) {
            const dish = getRandomDish()
            if (dish) {
              selectedInThisType.push(dish)
              // 从池中扣除
              temperaturePool[temperature] = (temperaturePool[temperature] || 0) - 1
              // 从剩余菜品中移除
              const index = remainingForType.findIndex(d => d.id === dish.id)
              if (index !== -1) remainingForType.splice(index, 1)
            }
          }
        }
        
        // 如果还需要更多菜品，从剩余的菜品中选择（不考虑温度）
        if (selectedInThisType.length < actualCount) {
          const { getRandomDish } = selectDishesForType(remainingForType)
          const stillNeeded = actualCount - selectedInThisType.length
          
          for (let j = 0; j < stillNeeded; j++) {
            const dish = getRandomDish()
            if (dish) {
              selectedInThisType.push(dish)
            }
          }
        }
      } else {
        // 没有温度约束时，正常选择，但要过滤掉被排除的温度
        let filteredForType = availableForType
        if (hasTemperatureConstraints) {
          filteredForType = availableForType.filter(dish => {
            const dishTemp = dish.temperature || '无'
            // 检查是否在约束中被明确设为0
            const tempConstraint = constraints.temperatureDistribution[dishTemp as NonNullable<Dish['temperature']>]
            return tempConstraint !== 0 // 不等于0的都可以选择
          })
        }
        
        const { getRandomDish } = selectDishesForType(filteredForType)
        
        for (let i = 0; i < actualCount; i++) {
          const dish = getRandomDish()
          if (dish) {
            selectedInThisType.push(dish)
          }
        }
      }
    }
    
    // 处理选中的菜品
    for (const dish of selectedInThisType) {
      if (!dish) continue // 跳过undefined
      
      // 计算实际数量：如果需要根据人数加量，数量为基础个数×人数；否则为基础个数
      const quantity = dish.scaleWithPeople ? dish.baseQuantity * constraints.headcount : dish.baseQuantity
      const dishPrice = dish.price // 保持单价不变
      const totalPrice = dishPrice * quantity

      // 如果不是自动安排模式，需要检查预算
      if (requestedCount !== -1) {
        if (totalCost + totalPrice > constraints.budget) {
          warnings.push('预算可能不足，无法满足所有约束')
          break
        }
      }

      // 找到同类型的其他可选菜品作为替换选项
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

      // 如果不是自动安排模式，需要累加totalCost
      if (requestedCount !== -1) {
        totalCost += totalPrice
      }
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
    
    // 对于值为-1的类型，也视为未完全指定（可以继续添加）
    const autoArrangeTypes = Object.entries(constraints.typeDistribution)
      .filter(([_, count]) => count === -1)
      .map(([type]) => type as Dish['type'])
    
    // 创建候选菜品池：包括未指定类型的菜品 + 已指定类型的额外菜品
    const candidatePool: Array<{ dish: Dish; type: Dish['type']; isExtra: boolean }> = []
    
    // 添加未指定类型的菜品
    unspecifiedTypes.forEach(type => {
      const dishes = dishesByType[type] || []
      dishes.forEach(dish => {
        // 检查温度约束，排除被设为0的温度
        if (hasTemperatureConstraints) {
          const dishTemp = dish.temperature || '无'
          const tempConstraint = constraints.temperatureDistribution[dishTemp as NonNullable<Dish['temperature']>]
          if (tempConstraint === 0) return // 跳过被排除的温度
        }
        candidatePool.push({ dish, type, isExtra: false })
      })
    })
    
    // 添加自动安排类型的额外菜品（-1值的类型可以继续添加）
    autoArrangeTypes.forEach(type => {
      const dishes = dishesByType[type] || []
      const alreadySelected = selectedDishes.filter(item => item.dish.type === type).map(item => item.dish.id)
      dishes
        .filter(dish => !alreadySelected.includes(dish.id))
        .forEach(dish => {
          // 检查温度约束，排除被设为0的温度
          if (hasTemperatureConstraints) {
            const dishTemp = dish.temperature || '无'
            const tempConstraint = constraints.temperatureDistribution[dishTemp as NonNullable<Dish['temperature']>]
            if (tempConstraint === 0) return // 跳过被排除的温度
          }
          candidatePool.push({ dish, type, isExtra: true })
        })
    })
    
    // 添加已指定类型的额外菜品（可以超出用户指定的数量）
    Object.entries(constraints.typeDistribution)
      .filter(([_, count]) => count > 0) // 只处理明确指定数量的类型
      .forEach(([type]) => {
        const dishes = dishesByType[type as Dish['type']] || []
        const alreadySelected = selectedDishes.filter(item => item.dish.type === type).map(item => item.dish.id)
        dishes
          .filter(dish => !alreadySelected.includes(dish.id))
          .forEach(dish => {
            // 检查温度约束，排除被设为0的温度
            if (hasTemperatureConstraints) {
              const dishTemp = dish.temperature || '无'
              const tempConstraint = constraints.temperatureDistribution[dishTemp as NonNullable<Dish['temperature']>]
              if (tempConstraint === 0) return // 跳过被排除的温度
            }
            candidatePool.push({ dish, type: type as Dish['type'], isExtra: true })
          })
      })
    
    // 按价格排序候选菜品（考虑实际数量）
    candidatePool.sort((a, b) => {
      const quantityA = a.dish.scaleWithPeople ? a.dish.baseQuantity * constraints.headcount : a.dish.baseQuantity
      const quantityB = b.dish.scaleWithPeople ? b.dish.baseQuantity * constraints.headcount : b.dish.baseQuantity
      const totalPriceA = a.dish.price * quantityA
      const totalPriceB = b.dish.price * quantityB
      return totalPriceA - totalPriceB
    })
    
    // 使用贪心算法填充预算：优先选择能让总价最接近目标的菜品
    while (totalCost < targetBudget && candidatePool.length > 0) {
      let bestCandidate: typeof candidatePool[0] | null = null
      let bestScore = -1
      
      // 寻找最佳候选菜品（让总价最接近目标预算的菜品）
      for (let i = 0; i < candidatePool.length; i++) {
        const candidate = candidatePool[i]!
        const quantity = candidate.dish.scaleWithPeople 
          ? candidate.dish.baseQuantity * constraints.headcount 
          : candidate.dish.baseQuantity
        const dishTotalPrice = candidate.dish.price * quantity
        const newTotalCost = totalCost + dishTotalPrice
        
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
        const quantity = dish.scaleWithPeople ? dish.baseQuantity * constraints.headcount : dish.baseQuantity
        const dishPrice = dish.price
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
      algorithmVersion: 'v1.4.0-autofix',
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
          const quantity = adjustment.newDish.scaleWithPeople 
            ? adjustment.newDish.baseQuantity * constraints.headcount 
            : adjustment.newDish.baseQuantity
          const dishPrice = adjustment.newDish.price
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
        
      case 'remove': {
        const removedDish = adjustedDishes[dishIndex]!
        adjustedDishes.splice(dishIndex, 1)
        warnings.push(`已移除菜品: ${removedDish.dish.name}`)
        break
      }
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