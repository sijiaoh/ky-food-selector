import { useState } from 'react'
import './App.css'
import { FileUpload } from './components/features/file-upload'
import { ConstraintsForm } from './components/features/constraints-form'
import { ResultsActions } from './components/features/results-actions'
import { parseExcelFile } from './services/excel-parser'
import { downloadSampleFile } from './utils/sample-data'
import { generateDishes, applyManualAdjustments } from './algorithms/dish-generator'
import type { ParsedFileData, Constraints, GenerationResult, ManualAdjustment } from './types'

function App() {
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [constraints, setConstraints] = useState<Constraints>({
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
  })

  const handleFileSelect = async (file: File) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await parseExcelFile(file)
      setParsedData(result)
      
      if (result.errors.length > 0) {
        setError(`文件解析完成，但有 ${result.errors.length} 个错误`)
      }
    } catch (err) {
      setError('文件解析失败，请检查文件格式')
      console.error('File parsing error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDishes = async () => {
    if (!parsedData?.dishes.length) return

    setGenerating(true)
    setError(null)

    try {
      // 添加小延迟让用户看到加载状态
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = generateDishes(parsedData.dishes, constraints)
      setGenerationResult(result)
      
      if (result.metadata.warnings.length > 0) {
        setError(`生成完成，但有 ${result.metadata.warnings.length} 个警告`)
      }
    } catch (err) {
      setError('菜品生成失败，请检查约束条件')
      console.error('Generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleApplyAdjustments = (adjustments: ManualAdjustment[]) => {
    if (!generationResult) return

    try {
      const adjustedResult = applyManualAdjustments(generationResult, adjustments, constraints)
      setGenerationResult(adjustedResult)
      
      if (adjustedResult.metadata.warnings.length > generationResult.metadata.warnings.length) {
        setError(`调整完成，但有新的警告`)
      } else {
        setError(null)
      }
    } catch (err) {
      setError('应用调整失败，请重试')
      console.error('Adjustment error:', err)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>KY点餐系统</h1>
        <p>智能菜品选择与点餐系统</p>
      </header>
      
      <main className="App-main">
        <section className="upload-section">
          <h2>1. 上传菜品数据</h2>
          <div className="upload-header">
            <p className="upload-description">
              请上传包含菜品信息的CSV或Excel文件。文件应包含：菜名、价格、类型、温度、荤素、标签、基础个数、根据人数加量等字段。
              <br />
              <strong>标签支持空格或逗号分隔</strong>，例如：&ldquo;猪肉 红烧 下饭&rdquo;或&ldquo;豆腐,川菜,素食&rdquo;。
              <br />
              <strong>温度、荤素等字段可以留空</strong>，系统会自动处理为可选属性。
            </p>
            <button 
              className="sample-button"
              onClick={downloadSampleFile}
              type="button"
            >
              📥 下载示例文件
            </button>
          </div>
          
          <FileUpload onFileSelect={handleFileSelect} loading={loading} />
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </section>

        {parsedData && (
          <section className="data-section">
            <h2>2. 菜单</h2>
            <div className="data-summary">
              <div className="summary-item">
                <span className="label">总行数:</span>
                <span className="value">{parsedData.metadata.totalRows}</span>
              </div>
              <div className="summary-item">
                <span className="label">有效菜品:</span>
                <span className="value">{parsedData.metadata.validRows}</span>
              </div>
              <div className="summary-item">
                <span className="label">解析时间:</span>
                <span className="value">{parsedData.metadata.parseTime}ms</span>
              </div>
            </div>

            {parsedData.dishes.length > 0 && (
              <div className="dishes-preview">
                <h3>菜品列表 ({parsedData.dishes.length}道菜)</h3>
                <div className="dishes-compact-list">
                  {parsedData.dishes.map((dish) => (
                    <div key={dish.id} className="dish-item">
                      <div className="dish-main">
                        <span className="dish-name">{dish.name}</span>
                        <span className="dish-price">¥{dish.price}</span>
                      </div>
                      <div className="dish-details">
                        <span className="dish-type-compact">{dish.type}</span>
                        <span className="dish-quantity-compact">{dish.baseQuantity}{dish.scaleWithPeople ? '×人数' : ''}</span>
                        {dish.temperature && <span className="dish-attr">{dish.temperature}</span>}
                        {dish.meatType && <span className="dish-attr">{dish.meatType}</span>}
                        {dish.tags.length > 0 && (
                          <div className="dish-tags-compact">
                            {dish.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="dish-tag-compact">{tag}</span>
                            ))}
                            {dish.tags.length > 3 && <span className="dish-tag-more">+{dish.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedData.errors.length > 0 && (
              <div className="errors-section">
                <h3>解析错误</h3>
                <div className="errors-list">
                  {parsedData.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="error-item">
                      第{error.row}行 {error.field}: {error.message}
                    </div>
                  ))}
                  {parsedData.errors.length > 5 && (
                    <div className="more-errors">
                      还有 {parsedData.errors.length - 5} 个错误...
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {parsedData && parsedData.dishes.length > 0 && (
          <section className="constraints-section">
            <h2>3. 设置约束条件</h2>
            <ConstraintsForm 
              constraints={constraints} 
              onChange={setConstraints}
            />
            
            <div className="generate-section">
              <button 
                className="generate-button"
                onClick={handleGenerateDishes}
                disabled={generating}
              >
                {generating ? '生成中...' : '🎯 生成菜品'}
              </button>
            </div>
          </section>
        )}

        {generationResult && (
          <section className="results-section">
            <h2>4. 生成结果</h2>
            <div className="result-summary">
              <div className="summary-item">
                <span className="label">菜品总数:</span>
                <span className="value">{generationResult.dishes.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">总价格:</span>
                <span className="value">¥{generationResult.totalCost}</span>
              </div>
              <div className="summary-item">
                <span className="label">生成时间:</span>
                <span className="value">{generationResult.metadata.generationTime}ms</span>
              </div>
            </div>

            {generationResult.metadata.warnings.length > 0 && (
              <div className="warnings-section">
                <h4>生成警告</h4>
                {generationResult.metadata.warnings.map((warning, index) => (
                  <div key={index} className="warning">{warning}</div>
                ))}
              </div>
            )}

            <ResultsActions
              result={generationResult}
              onRegenerate={handleGenerateDishes}
              onApplyAdjustments={handleApplyAdjustments}
            />
          </section>
        )}
      </main>
      
      <footer className="App-footer">
        <div className="version-info">
          版本 v{import.meta.env.PACKAGE_VERSION || '1.1.0'} • 构建时间 {new Date(import.meta.env.BUILD_TIME || new Date()).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
          <button 
            className="refresh-cache-btn"
            onClick={() => {
              // 强制刷新缓存
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(registration => registration.unregister())
                })
              }
              // 清除所有缓存
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name))
                })
              }
              // 强制刷新页面
              window.location.reload()
            }}
            title="清除缓存并刷新"
          >
            🔄
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App