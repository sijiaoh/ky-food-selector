import type { Constraints, ValidationResult } from '@/types'
import { DISH_TYPES, TEMPERATURES, MEAT_TYPES } from '@/constants'

export function validateConstraints(constraints: Constraints): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // 验证基础必填字段
  if (constraints.headcount < 1) {
    errors.push('人数必须大于等于1')
  }
  
  if (constraints.budget <= 0) {
    errors.push('预算必须大于0')
  }
  
  // 验证类型分布
  for (const [type, count] of Object.entries(constraints.typeDistribution)) {
    if (!DISH_TYPES.includes(type as any)) {
      errors.push(`无效的菜品类型: ${type}`)
    }
    if (count !== undefined && count < 0) {
      errors.push(`菜品类型 ${type} 的数量不能为负数`)
    }
  }
  
  // 验证温度分布
  for (const [temperature, count] of Object.entries(constraints.temperatureDistribution)) {
    if (!TEMPERATURES.includes(temperature as any)) {
      errors.push(`无效的温度类型: ${temperature}`)
    }
    if (count !== undefined && count < 0) {
      errors.push(`温度类型 ${temperature} 的数量不能为负数`)
    }
  }
  
  // 验证荤素分布
  for (const [meatType, count] of Object.entries(constraints.meatDistribution)) {
    if (!MEAT_TYPES.includes(meatType as any)) {
      errors.push(`无效的荤素类型: ${meatType}`)
    }
    if (count !== undefined && count < 0) {
      errors.push(`荤素类型 ${meatType} 的数量不能为负数`)
    }
  }
  
  // 验证标签要求
  for (const [tag, count] of Object.entries(constraints.tagRequirements)) {
    if (count < 0) {
      errors.push(`标签 ${tag} 的要求数量不能为负数`)
    }
  }
  
  // 验证排除的过敏原
  if (constraints.excludedAllergens && constraints.excludedAllergens.length > 0) {
    // 暂时只检查数组格式正确
    if (!Array.isArray(constraints.excludedAllergens)) {
      errors.push('排除的过敏原必须是数组格式')
    }
  }
  
  // 验证辣度限制
  if (constraints.maxSpicyLevel !== undefined) {
    if (constraints.maxSpicyLevel < 1 || constraints.maxSpicyLevel > 5) {
      errors.push('最大辣度限制必须在1-5之间')
    }
  }
  
  // 验证制作时间限制
  if (constraints.maxCookingTime !== undefined && constraints.maxCookingTime <= 0) {
    errors.push('最大制作时间必须大于0')
  }
  
  // 添加警告
  const totalRequiredDishes = Object.values(constraints.typeDistribution).reduce((sum, count) => sum + (count || 0), 0)
  if (totalRequiredDishes === 0) {
    warnings.push('未设置任何菜品类型要求，可能无法生成合理的菜品搭配')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}