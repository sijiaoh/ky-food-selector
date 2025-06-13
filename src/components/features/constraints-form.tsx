import { useState } from 'react'
import type { Constraints, Dish } from '../../types'
import './constraints-form.css'

interface ConstraintsFormProps {
  constraints: Constraints
  onChange: (constraints: Constraints) => void
}

export function ConstraintsForm({ constraints, onChange }: ConstraintsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const dishTypes: Dish['type'][] = ['主食', '主菜', '副菜', '汤', '点心']
  
  // 计算菜品总数
  const totalDishes = Object.values(constraints.typeDistribution).reduce((sum, count) => sum + (count || 0), 0)
  
  // 计算建议预算 (假设平均每道菜20元)
  const suggestedBudget = Math.max(totalDishes * 20, constraints.headcount * 30)
  
  // 生成警告信息
  const warnings: string[] = []
  if (totalDishes > constraints.headcount * 2) {
    warnings.push('菜品数量可能过多，建议减少菜品数量')
  }
  if (constraints.budget < suggestedBudget * 0.7) {
    warnings.push('预算可能不足，建议增加预算或减少菜品')
  }

  // 预设配置
  const presets = [
    {
      name: '家庭聚餐',
      config: {
        headcount: 6,
        budget: 300,
        typeDistribution: {
          '主食': 2,
          '主菜': 3,
          '副菜': 2,
          '汤': 1,
          '点心': 1
        },
        temperatureDistribution: {},
        meatDistribution: {},
        tagRequirements: {},
        excludedTags: []
      }
    },
    {
      name: '商务宴请',
      config: {
        headcount: 8,
        budget: 500,
        typeDistribution: {
          '主食': 2,
          '主菜': 4,
          '副菜': 3,
          '汤': 2,
          '点心': 2
        },
        temperatureDistribution: {},
        meatDistribution: {},
        tagRequirements: {},
        excludedTags: []
      }
    },
    {
      name: '简单聚会',
      config: {
        headcount: 3,
        budget: 150,
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
    }
  ]

  const validateAndUpdate = (field: keyof Constraints, value: number) => {
    const newErrors = { ...errors }

    // 验证逻辑
    if (field === 'headcount' && value <= 0) {
      newErrors.headcount = '人数必须大于0'
    } else if (field === 'headcount') {
      delete newErrors.headcount
    }

    if (field === 'budget' && value <= 0) {
      newErrors.budget = '预算必须大于0'
    } else if (field === 'budget') {
      delete newErrors.budget
    }

    setErrors(newErrors)

    // 如果没有错误，更新约束条件
    if (!newErrors[field]) {
      onChange({
        ...constraints,
        [field]: value
      })
    }
  }

  const handleTypeDistributionChange = (type: Dish['type'], value: number) => {
    const newTypeDistribution = {
      ...constraints.typeDistribution,
      [type]: value
    }
    onChange({
      ...constraints,
      typeDistribution: newTypeDistribution
    })
  }

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onChange(preset.config)
  }

  const handleSaveConfig = () => {
    const configName = prompt('请输入配置名称：')
    if (configName) {
      // 这里可以实现保存到本地存储的逻辑
      console.log('保存配置：', configName, constraints)
      alert(`配置 "${configName}" 已保存！`)
    }
  }

  return (
    <div className="constraints-form">
      <div className="form-section">
        <h3>快速配置</h3>
        <div className="presets-container">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="preset-button"
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            className="save-button"
            onClick={handleSaveConfig}
          >
            保存配置
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3>基础设置</h3>
        
        <div className="form-field">
          <label htmlFor="headcount">人数</label>
          <input
            id="headcount"
            type="number"
            min="1"
            value={constraints.headcount}
            onChange={(e) => validateAndUpdate('headcount', parseInt(e.target.value) || 0)}
          />
          {errors.headcount && <span className="error">{errors.headcount}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="budget">预算 (元)</label>
          <input
            id="budget"
            type="number"
            min="1"
            value={constraints.budget}
            onChange={(e) => validateAndUpdate('budget', parseInt(e.target.value) || 0)}
          />
          {errors.budget && <span className="error">{errors.budget}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>菜品类型搭配</h3>
        {dishTypes.map((type) => (
          <div key={type} className="form-field">
            <label htmlFor={`type-${type}`}>{type}</label>
            <input
              id={`type-${type}`}
              type="number"
              min="0"
              value={constraints.typeDistribution[type] || 0}
              onChange={(e) => handleTypeDistributionChange(type, parseInt(e.target.value) || 0)}
            />
          </div>
        ))}
        
        <div className="summary-info">
          <p className="dish-count">当前选择总共 {totalDishes} 道菜</p>
          <p className="budget-suggestion">建议预算: ¥{suggestedBudget}</p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warnings-section">
          <h4>提示</h4>
          {warnings.map((warning, index) => (
            <div key={index} className="warning">{warning}</div>
          ))}
        </div>
      )}
    </div>
  )
}