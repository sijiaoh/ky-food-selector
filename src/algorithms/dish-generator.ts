import type { Dish, Constraints, GenerationResult } from '../types'

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

      selectedDishes.push({
        dish,
        quantity,
        totalPrice,
        isFixed: false
      })

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