import { describe, it, expect } from 'vitest'
import { validateConstraints } from '../constraint-validator'
import type { Constraints } from '@/types'

describe('约束条件验证器', () => {
  it('应该验证合法的约束条件', () => {
    const validConstraints: Constraints = {
      headcount: 6,
      budget: 300,
      typeDistribution: {
        '主食': 1,
        '主菜': 2,
        '副菜': 1,
      },
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: [],
    }
    
    const result = validateConstraints(validConstraints)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('应该拒绝人数小于1的约束', () => {
    const invalidConstraints: Constraints = {
      headcount: 0,
      budget: 300,
      typeDistribution: {},
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: [],
    }
    
    const result = validateConstraints(invalidConstraints)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('人数必须大于等于1')
  })

  it('应该拒绝预算小于等于0的约束', () => {
    const invalidConstraints: Constraints = {
      headcount: 4,
      budget: -100,
      typeDistribution: {},
      temperatureDistribution: {},
      meatDistribution: {},
      tagRequirements: {},
      excludedTags: [],
    }
    
    const result = validateConstraints(invalidConstraints)
    
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('预算必须大于0')
  })
})