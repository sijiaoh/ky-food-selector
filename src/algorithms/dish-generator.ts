import type { Dish, Constraints, GenerationResult, ManualAdjustment } from '../types'

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

  // 为每种类型选择菜品
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

    // 按价格排序，优先选择较便宜的
    const sortedDishes = availableForType.sort((a, b) => a.price - b.price)
    
    for (let i = 0; i < actualCount; i++) {
      const dish = sortedDishes[i]
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
      const alternatives = sortedDishes
        .filter(altDish => altDish.id !== dish.id)
        .slice(0, 3) // 最多3个替换选项

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

  const generationTime = Date.now() - startTime

  return {
    dishes: selectedDishes,
    totalCost,
    metadata: {
      generationTime,
      algorithmVersion: 'v1.0.0-basic',
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