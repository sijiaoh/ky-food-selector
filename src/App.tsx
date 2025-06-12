import { useState } from 'react'
import './App.css'
import { FileUpload } from './components/features/file-upload'
import { parseExcelFile } from './services/excel-parser'
import { downloadSampleFile } from './utils/sample-data'
import type { ParsedFileData } from './types'

function App() {
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
              <strong>标签支持空格或逗号分隔</strong>，例如："猪肉 红烧 下饭"或"豆腐,川菜,素食"。
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
            <h2>2. 数据概览</h2>
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
                <h3>菜品列表</h3>
                <div className="dishes-table-container">
                  <table className="dishes-table">
                    <thead>
                      <tr>
                        <th>菜名</th>
                        <th>价格</th>
                        <th>类型</th>
                        <th>温度</th>
                        <th>荤素</th>
                        <th>标签</th>
                        <th>基础个数</th>
                        <th>根据人数加量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.dishes.map((dish) => (
                        <tr key={dish.id}>
                          <td className="dish-name">{dish.name}</td>
                          <td className="dish-price">¥{dish.price}</td>
                          <td className="dish-type">{dish.type}</td>
                          <td className="dish-temperature">{dish.temperature || '-'}</td>
                          <td className="dish-meat">{dish.meatType || '-'}</td>
                          <td className="dish-tags">
                            {dish.tags.length > 0 ? (
                              <div className="tags-container">
                                {dish.tags.map((tag, index) => (
                                  <span key={index} className="tag">{tag}</span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="dish-quantity">{dish.baseQuantity}</td>
                          <td className="dish-scale">{dish.scaleWithPeople ? '是' : '否'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <p>约束条件配置功能正在开发中...</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App