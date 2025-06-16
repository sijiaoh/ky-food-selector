import { useState } from 'react'
import type { GenerationResult, ManualAdjustment, Dish } from '../../types'

interface ResultsActionsProps {
  result: GenerationResult
  onRegenerate: () => void
  onApplyAdjustments: (adjustments: ManualAdjustment[]) => void
  onToggleFixed: (dishId: string) => void
}

export function ResultsActions({ 
  result, 
  onRegenerate, 
  onApplyAdjustments,
  onToggleFixed
}: ResultsActionsProps) {
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([])
  const [showAlternatives, setShowAlternatives] = useState<Record<string, boolean>>({})

  const handleToggleFixed = (dishId: string) => {
    onToggleFixed(dishId)
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

  const isFixed = (dishId: string) => {
    // 直接从result中获取固定状态
    const dishItem = result.dishes.find(item => item.dish.id === dishId)
    return dishItem?.isFixed || false
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
          <button 
            className="action-button apply-button"
            onClick={applyChanges}
          >
            ✅ 应用替换和移除 ({adjustments.length})
          </button>
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
                <th>温度</th>
                <th>荤素</th>
                <th>标签</th>
                <th>数量</th>
                <th>单价</th>
                <th>总价</th>
                <th>详情</th>
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
                    <td className="dish-temperature">
                      <span className={`temperature-tag ${displayDish.temperature || '无'}`}>
                        {displayDish.temperature || '无'}
                      </span>
                    </td>
                    <td className="dish-meat-type">
                      <span className={`meat-tag ${displayDish.meatType || '无'}`}>
                        {displayDish.meatType || '无'}
                      </span>
                    </td>
                    <td className="dish-tags">
                      {displayDish.tags.length > 0 ? (
                        <div className="tags-container">
                          {displayDish.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="no-tags">-</span>
                      )}
                    </td>
                    <td className="dish-quantity">
                      {quantity}
                      {displayDish.scaleWithPeople && (
                        <span className="quantity-note" title="根据人数加量">👥</span>
                      )}
                    </td>
                    <td className="dish-price">¥{displayDish.price}</td>
                    <td className="dish-total">¥{totalPrice}</td>
                    <td className="dish-details">
                      <div className="details-info">
                        {displayDish.description && (
                          <div className="description" title={displayDish.description}>📝</div>
                        )}
                        {displayDish.spicyLevel && (
                          <div className="spicy-level" title={`辣度：${displayDish.spicyLevel}级`}>
                            🌶️{displayDish.spicyLevel}
                          </div>
                        )}
                        {displayDish.cookingTime && (
                          <div className="cooking-time" title={`制作时间：${displayDish.cookingTime}分钟`}>
                            ⏱️{displayDish.cookingTime}m
                          </div>
                        )}
                        {displayDish.allergens && displayDish.allergens.length > 0 && (
                          <div className="allergens" title={`过敏原：${displayDish.allergens.join(', ')}`}>
                            ⚠️
                          </div>
                        )}
                        {displayDish.popularity && (
                          <div className="popularity" title={`受欢迎程度：${(displayDish.popularity * 100).toFixed(0)}%`}>
                            ⭐{(displayDish.popularity * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="dish-actions">
                      {!removed && (
                        <div className="action-group">
                          <button
                            className={`action-btn ${fixed ? 'active' : ''}`}
                            onClick={() => handleToggleFixed(dishId)}
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
                          
                          {!fixed && (
                            <button
                              className="action-btn remove"
                              onClick={() => handleRemoveDish(dishId)}
                              title="移除此菜品"
                            >
                              ❌
                            </button>
                          )}
                          
                          {fixed && (
                            <button
                              className="action-btn remove disabled"
                              disabled
                              title="固定菜品不能移除"
                            >
                              🔒
                            </button>
                          )}
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