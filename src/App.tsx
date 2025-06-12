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
                <h3>菜品预览</h3>
                <div className="dishes-grid">
                  {parsedData.dishes.slice(0, 6).map((dish) => (
                    <div key={dish.id} className="dish-card">
                      <div className="dish-name">{dish.name}</div>
                      <div className="dish-price">¥{dish.price}</div>
                      <div className="dish-type">{dish.type}</div>
                    </div>
                  ))}
                </div>
                {parsedData.dishes.length > 6 && (
                  <p className="more-dishes">
                    还有 {parsedData.dishes.length - 6} 个菜品...
                  </p>
                )}
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