import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConstraintsForm } from '../constraints-form'
import type { Constraints } from '../../../types'

describe('ConstraintsForm', () => {
  const mockOnChange = vi.fn()
  const defaultConstraints: Constraints = {
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

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('应该渲染基础约束条件表单', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    // 验证基础字段存在
    expect(screen.getByLabelText('人数')).toBeInTheDocument()
    expect(screen.getByLabelText('预算 (元)')).toBeInTheDocument()
    expect(screen.getByText('菜品类型搭配')).toBeInTheDocument()
  })

  it('应该显示当前约束条件的值', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const headcountInput = screen.getByLabelText('人数') as HTMLInputElement
    const budgetInput = screen.getByLabelText('预算 (元)') as HTMLInputElement
    
    expect(headcountInput.value).toBe('4')
    expect(budgetInput.value).toBe('200')
  })

  it('应该在人数改变时调用onChange', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const headcountInput = screen.getByLabelText('人数')
    fireEvent.change(headcountInput, { target: { value: '6' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultConstraints,
      headcount: 6
    })
  })

  it('应该在预算改变时调用onChange', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const budgetInput = screen.getByLabelText('预算 (元)')
    fireEvent.change(budgetInput, { target: { value: '300' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultConstraints,
      budget: 300
    })
  })

  it('应该显示菜品类型搭配选项', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    expect(screen.getByText('主食')).toBeInTheDocument()
    expect(screen.getByText('主菜')).toBeInTheDocument()
    expect(screen.getByText('副菜')).toBeInTheDocument()
    expect(screen.getByText('汤')).toBeInTheDocument()
    expect(screen.getByText('点心')).toBeInTheDocument()
  })

  it('应该在类型分布改变时调用onChange', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    // 找到主菜的输入框（现在label包含了提示文本）
    const mainDishInput = screen.getByLabelText(/主菜/)
    
    fireEvent.change(mainDishInput, { target: { value: '3' } })
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('应该验证人数不能小于1', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const headcountInput = screen.getByLabelText('人数')
    fireEvent.change(headcountInput, { target: { value: '0' } })
    
    expect(screen.getByText('人数必须大于0')).toBeInTheDocument()
  })

  it('应该验证预算不能小于等于0', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const budgetInput = screen.getByLabelText('预算 (元)')
    fireEvent.change(budgetInput, { target: { value: '0' } })
    
    expect(screen.getByText('预算必须大于0')).toBeInTheDocument()
  })

  it('应该计算菜品类型总数并显示提示', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    // 默认配置总数应该是5道菜 (1+2+1+1+0)
    expect(screen.getByText('当前选择总共 5 道菜')).toBeInTheDocument()
  })

  it('应该在菜品数量与人数不合理时显示警告', () => {
    const constraintsWithManyDishes: Constraints = {
      ...defaultConstraints,
      headcount: 2,
      typeDistribution: {
        '主食': 3,
        '主菜': 5,
        '副菜': 4,
        '汤': 2,
        '点心': 3
      }
    }
    
    render(<ConstraintsForm constraints={constraintsWithManyDishes} onChange={mockOnChange} />)
    
    expect(screen.getByText(/菜品数量可能过多/)).toBeInTheDocument()
  })

  it('应该在预算过低时显示警告', () => {
    const constraintsWithLowBudget: Constraints = {
      ...defaultConstraints,
      budget: 30 // 很低的预算
    }
    
    render(<ConstraintsForm constraints={constraintsWithLowBudget} onChange={mockOnChange} />)
    
    expect(screen.getByText(/预算可能不足/)).toBeInTheDocument()
  })

  it('应该提供预算建议', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    expect(screen.getByText(/建议预算/)).toBeInTheDocument()
  })

  it('应该显示预设配置选项', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    expect(screen.getByText('快速配置')).toBeInTheDocument()
    expect(screen.getByText('家庭聚餐')).toBeInTheDocument()
    expect(screen.getByText('商务宴请')).toBeInTheDocument()
    expect(screen.getByText('简单聚会')).toBeInTheDocument()
  })

  it('应该在点击预设配置时更新约束条件', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    const familyPresetButton = screen.getByText('家庭聚餐')
    fireEvent.click(familyPresetButton)
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        headcount: 6,
        budget: 300,
        typeDistribution: expect.objectContaining({
          '主食': 2,
          '主菜': 3,
          '副菜': 2,
          '汤': 1,
          '点心': 1
        })
      })
    )
  })

  it('应该显示保存配置按钮', () => {
    render(<ConstraintsForm constraints={defaultConstraints} onChange={mockOnChange} />)
    
    expect(screen.getByText('保存配置')).toBeInTheDocument()
  })
})