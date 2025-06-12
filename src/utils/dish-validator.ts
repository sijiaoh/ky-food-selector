import type { Dish, ValidationResult } from '@/types'
import { DISH_TYPES, TEMPERATURES, MEAT_TYPES } from '@/constants'

export function validateDish(dish: Dish): ValidationResult {
  const errors: string[] = []
  
  // 验证必填字段
  if (!dish.name?.trim()) {
    errors.push('菜名不能为空')
  }
  
  if (dish.price <= 0) {
    errors.push('价格必须大于0')
  }
  
  if (!DISH_TYPES.includes(dish.type)) {
    errors.push(`菜品类型必须是以下之一: ${DISH_TYPES.join(', ')}`)
  }
  
  if (dish.temperature && !TEMPERATURES.includes(dish.temperature)) {
    errors.push(`温度必须是以下之一: ${TEMPERATURES.join(', ')}`)
  }
  
  if (dish.meatType && !MEAT_TYPES.includes(dish.meatType)) {
    errors.push(`荤素类型必须是以下之一: ${MEAT_TYPES.join(', ')}`)
  }
  
  if (dish.baseQuantity < 1) {
    errors.push('基础个数必须大于等于1')
  }
  
  if (dish.spicyLevel && (dish.spicyLevel < 1 || dish.spicyLevel > 5)) {
    errors.push('辣度等级必须在1-5之间')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  }
}