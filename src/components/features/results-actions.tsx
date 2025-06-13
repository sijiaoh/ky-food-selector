import { useState } from 'react'
import type { GenerationResult, ManualAdjustment, Dish, Constraints } from '../../types'

interface ResultsActionsProps {
  result: GenerationResult
  constraints: Constraints
  onRegenerate: () => void
  onApplyAdjustments: (adjustments: ManualAdjustment[]) => void
}

export function ResultsActions({ 
  result, 
  constraints, 
  onRegenerate, 
  onApplyAdjustments 
}: ResultsActionsProps) {
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([])
  const [showAlternatives, setShowAlternatives] = useState<Record<string, boolean>>({})

  const handleFixDish = (dishId: string) => {
    const newAdjustment: ManualAdjustment = { type: 'fix', dishId }
    setAdjustments([...adjustments.filter(adj => adj.dishId !== dishId), newAdjustment])
  }

  const handleReplaceDish = (dishId: string, newDish: Dish) => {
    const newAdjustment: ManualAdjustment = { type: 'replace', dishId, newDish }
    setAdjustments([...adjustments.filter(adj => adj.dishId !== dishId), newAdjustment])
    setShowAlternatives({ ...showAlternatives, [dishId]: false })
  }

  const handleRemoveDish = (dishId: string) => {
    const newAdjustment: ManualAdjustment = { type: 'remove', dishId }
    setAdjustments([...adjustments.filter(adj => adj.dishId !== dishId), newAdjustment])
  }

  const toggleAlternatives = (dishId: string) => {
    setShowAlternatives({ 
      ...showAlternatives, 
      [dishId]: !showAlternatives[dishId] 
    })
  }

  const applyChanges = () => {
    onApplyAdjustments(adjustments)
    setAdjustments([])
    setShowAlternatives({})
  }

  const resetChanges = () => {
    setAdjustments([])
    setShowAlternatives({})
  }

  const isFixed = (dishId: string) => {
    return adjustments.some(adj => adj.dishId === dishId && adj.type === 'fix')
  }

  const isReplaced = (dishId: string) => {
    return adjustments.some(adj => adj.dishId === dishId && adj.type === 'replace')
  }

  const isRemoved = (dishId: string) => {
    return adjustments.some(adj => adj.dishId === dishId && adj.type === 'remove')
  }

  const getReplacementDish = (dishId: string): Dish | undefined => {
    const replacement = adjustments.find(adj => adj.dishId === dishId && adj.type === 'replace')
    return replacement?.newDish
  }

  return (
    <div className="results-actions">
      <div className="action-buttons">
        <button 
          className="action-button regenerate-button"
          onClick={onRegenerate}
        >
          🔄 重新生成
        </button>
        
        {adjustments.length > 0 && (
          <>
            <button 
              className="action-button apply-button"
              onClick={applyChanges}
            >
              ✅ 应用更改 ({adjustments.length})
            </button>
            <button 
              className="action-button reset-button"
              onClick={resetChanges}
            >
              ↶ 重置更改
            </button>
          </>
        )}
      </div>

      <div className="dishes-with-actions">
        <h3>菜品详情</h3>
        <div className="dishes-table-container">
          <table className="dishes-table">
            <thead>
              <tr>
                <th>菜名</th>
                <th>类型</th>
                <th>数量</th>
                <th>单价</th>
                <th>总价</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {result.dishes.map(({ dish, quantity, totalPrice, canReplace, alternatives }) => {
                const dishId = dish.id
                const fixed = isFixed(dishId)
                const replaced = isReplaced(dishId)
                const removed = isRemoved(dishId)
                const replacementDish = getReplacementDish(dishId)
                const displayDish = replacementDish || dish

                return (
                  <tr 
                    key={dishId} 
                    className={`
                      ${fixed ? 'dish-fixed' : ''} 
                      ${replaced ? 'dish-replaced' : ''} 
                      ${removed ? 'dish-removed' : ''}
                    `}
                  >
                    <td className="dish-name">
                      {displayDish.name}
                      {fixed && <span className="status-badge fixed">📌</span>}
                      {replaced && <span className="status-badge replaced">🔄</span>}
                      {removed && <span className="status-badge removed">❌</span>}
                    </td>
                    <td className="dish-type">{displayDish.type}</td>
                    <td className="dish-quantity">{quantity}</td>
                    <td className="dish-price">
                      ¥{displayDish.scaleWithPeople ? `${displayDish.price} × ${constraints.headcount}人` : displayDish.price}
                    </td>
                    <td className="dish-total">¥{totalPrice}</td>
                    <td className="dish-actions">
                      {!removed && (
                        <div className="action-group">
                          <button
                            className={`action-btn ${fixed ? 'active' : ''}`}
                            onClick={() => handleFixDish(dishId)}
                            title={fixed ? '取消固定' : '固定此菜品'}
                          >
                            📌
                          </button>
                          
                          {canReplace && alternatives && alternatives.length > 0 && (
                            <button
                              className="action-btn"
                              onClick={() => toggleAlternatives(dishId)}
                              title="查看替换选项"
                            >
                              🔄
                            </button>
                          )}
                          
                          <button
                            className="action-btn remove"
                            onClick={() => handleRemoveDish(dishId)}
                            title="移除此菜品"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                      
                      {removed && (
                        <button
                          className="action-btn undo"
                          onClick={() => setAdjustments(adjustments.filter(adj => adj.dishId !== dishId))}
                          title="撤销移除"
                        >
                          ↶
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 替换选项 */}
        {Object.entries(showAlternatives).map(([dishId, show]) => {
          if (!show) return null
          
          const dishItem = result.dishes.find(item => item.dish.id === dishId)
          if (!dishItem?.alternatives) return null

          return (
            <div key={`alternatives-${dishId}`} className="alternatives-panel">
              <h4>替换选项 - {dishItem.dish.name}</h4>
              <div className="alternatives-grid">
                {dishItem.alternatives.map(altDish => (
                  <div key={altDish.id} className="alternative-card">
                    <div className="alt-info">
                      <div className="alt-name">{altDish.name}</div>
                      <div className="alt-price">¥{altDish.price}</div>
                      <div className="alt-tags">
                        {altDish.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="replace-btn"
                      onClick={() => handleReplaceDish(dishId, altDish)}
                    >
                      替换
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}