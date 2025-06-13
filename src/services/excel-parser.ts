import type { ParsedFileData, Dish } from '@/types'
import { parseCSVLine } from '@/utils/csv-parser'
import * as XLSX from 'xlsx'

// 字段名映射配置
const FIELD_MAPPINGS = {
  name: ['菜名', '菜品名称', '名称', 'name', '菜品'],
  price: ['价格', '单价', 'price', '金额'],
  type: ['类型', '菜品类型', 'type', '分类'],
  temperature: ['温度', '温热', 'temperature', '冷热'],
  meatType: ['荤素', '肉类', 'meat', '荤菜素菜', '荤/素'],
  tags: ['标签', 'tags', '特色', '备注'],
  baseQuantity: ['基础个数', '基本个数', '默认个数', '个数', 'quantity', '数量'],
  scaleWithPeople: ['根据人数加量', '人数加量', '是否加量', 'scale', '按人数']
}

function findColumnIndex(headers: string[], fieldMappings: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.trim()
    if (header && fieldMappings.some(mapping => 
      header.toLowerCase().includes(mapping.toLowerCase()) || 
      mapping.toLowerCase().includes(header.toLowerCase())
    )) {
      return i
    }
  }
  return -1
}

// 通用数据处理函数
function processRowData(
  headers: string[], 
  rowData: (string | number)[], 
  rowIndex: number
): {
  dish?: Dish
  errors: Array<{ row: number; field: string; message: string }>
} {
  const errors: Array<{ row: number; field: string; message: string }> = []

  // 查找各字段的列索引
  const columnIndexes = {
    name: findColumnIndex(headers, FIELD_MAPPINGS.name),
    price: findColumnIndex(headers, FIELD_MAPPINGS.price),
    type: findColumnIndex(headers, FIELD_MAPPINGS.type),
    temperature: findColumnIndex(headers, FIELD_MAPPINGS.temperature),
    meatType: findColumnIndex(headers, FIELD_MAPPINGS.meatType),
    tags: findColumnIndex(headers, FIELD_MAPPINGS.tags),
    baseQuantity: findColumnIndex(headers, FIELD_MAPPINGS.baseQuantity),
    scaleWithPeople: findColumnIndex(headers, FIELD_MAPPINGS.scaleWithPeople)
  }

  // 基于字段索引获取数据
  const name = columnIndexes.name >= 0 ? String(rowData[columnIndexes.name] || '').trim() : ''
  const priceStr = columnIndexes.price >= 0 ? String(rowData[columnIndexes.price] || '') : ''
  const type = columnIndexes.type >= 0 ? String(rowData[columnIndexes.type] || '').trim() : ''
  const temperature = columnIndexes.temperature >= 0 ? String(rowData[columnIndexes.temperature] || '').trim() : ''
  const meatType = columnIndexes.meatType >= 0 ? String(rowData[columnIndexes.meatType] || '').trim() : ''
  const tagsStr = columnIndexes.tags >= 0 ? String(rowData[columnIndexes.tags] || '').trim() : ''
  const baseQuantityStr = columnIndexes.baseQuantity >= 0 ? String(rowData[columnIndexes.baseQuantity] || '1') : '1'
  const scaleWithPeopleStr = columnIndexes.scaleWithPeople >= 0 ? String(rowData[columnIndexes.scaleWithPeople] || 'No') : 'No'
  
  if (!name) {
    errors.push({ row: rowIndex, field: 'name', message: '菜名不能为空' })
    return { errors }
  }
  
  const price = Number(priceStr)
  if (isNaN(price) || price <= 0) {
    errors.push({ row: rowIndex, field: 'price', message: '价格必须是大于0的数字' })
    return { errors }
  }
  
  // 解析标签：支持空格和逗号分隔
  let tags: string[] = []
  if (tagsStr) {
    // 先按逗号分割，再按空格分割
    const tagParts = tagsStr.split(',').flatMap(part => part.split(' '))
    tags = tagParts.filter(tag => tag.trim()).map(tag => tag.trim())
  }
  
  // 解析"根据人数加量"字段，支持多种格式
  let scaleWithPeople = false
  if (scaleWithPeopleStr) {
    const normalizedValue = scaleWithPeopleStr.toLowerCase().trim()
    scaleWithPeople = ['yes', 'true', '是', '1', 'y', '需要', '要'].includes(normalizedValue)
  }
  
  const dish: Dish = {
    id: `dish_${Date.now()}_${rowIndex}`,
    name,
    price,
    type: type as Dish['type'],
    ...(temperature && temperature !== '无' && temperature !== '' && { 
      temperature: temperature as Dish['temperature'] 
    }),
    ...(meatType && meatType !== '无' && meatType !== '' && { 
      meatType: meatType as Dish['meatType'] 
    }),
    tags,
    baseQuantity: Number(baseQuantityStr) || 1,
    scaleWithPeople,
  }
  
  return { dish, errors }
}

async function parseCSVFile(file: File): Promise<ParsedFileData> {
  const content = await file.text()
  const lines = content.trim().split('\n')
  
  if (lines.length <= 1) {
    return {
      dishes: [],
      errors: [],
      warnings: [],
      metadata: {
        totalRows: lines.length,
        validRows: 0,
        fileSize: file.size,
        parseTime: 0,
      },
    }
  }

  const dishes: Dish[] = []
  const errors: Array<{ row: number; field: string; message: string }> = []
  
  // 解析表头
  const headerLine = lines[0]?.trim()
  if (!headerLine) {
    errors.push({
      row: 1,
      field: 'header',
      message: '缺少表头行'
    })
    return {
      dishes: [],
      errors,
      warnings: [],
      metadata: {
        totalRows: lines.length,
        validRows: 0,
        fileSize: file.size,
        parseTime: 0,
      },
    }
  }
  
  const headers = parseCSVLine(headerLine)
  
  // 从第二行开始处理数据
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]?.trim()
    if (!row) continue
    
    const columns = parseCSVLine(row)
    const { dish, errors: rowErrors } = processRowData(headers, columns, i + 1)
    
    errors.push(...rowErrors)
    if (dish) {
      dishes.push(dish)
    }
  }

  return { dishes, errors, warnings: [], metadata: { totalRows: lines.length, validRows: dishes.length, fileSize: file.size, parseTime: 0 } }
}

async function parseExcelWorkbook(file: File): Promise<ParsedFileData> {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  
  // 使用第一个工作表
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return {
      dishes: [],
      errors: [{ row: 1, field: 'sheet', message: 'Excel文件中没有找到工作表' }],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        fileSize: file.size,
        parseTime: 0,
      },
    }
  }

  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    return {
      dishes: [],
      errors: [{ row: 1, field: 'sheet', message: 'Excel工作表为空' }],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        fileSize: file.size,
        parseTime: 0,
      },
    }
  }

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as (string | number)[][]
  
  if (jsonData.length <= 1) {
    return {
      dishes: [],
      errors: [],
      warnings: [],
      metadata: {
        totalRows: jsonData.length,
        validRows: 0,
        fileSize: file.size,
        parseTime: 0,
      },
    }
  }

  const dishes: Dish[] = []
  const errors: Array<{ row: number; field: string; message: string }> = []
  
  // 第一行是表头
  const headers = jsonData[0]?.map(h => String(h).trim()) || []
  
  // 从第二行开始处理数据
  for (let i = 1; i < jsonData.length; i++) {
    const rowData = jsonData[i]
    if (!rowData || rowData.length === 0) continue
    
    const { dish, errors: rowErrors } = processRowData(headers, rowData, i + 1)
    
    errors.push(...rowErrors)
    if (dish) {
      dishes.push(dish)
    }
  }

  return { dishes, errors, warnings: [], metadata: { totalRows: jsonData.length, validRows: dishes.length, fileSize: file.size, parseTime: 0 } }
}

export async function parseExcelFile(file: File): Promise<ParsedFileData> {
  const startTime = Date.now()
  
  if (file.size === 0) {
    return {
      dishes: [],
      errors: [],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        fileSize: file.size,
        parseTime: Date.now() - startTime,
      },
    }
  }

  let result: ParsedFileData

  try {
    // 根据文件扩展名决定解析方法
    const fileName = file.name?.toLowerCase() || ''
    if (fileName.endsWith('.csv')) {
      result = await parseCSVFile(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      result = await parseExcelWorkbook(file)
    } else {
      // 默认尝试CSV解析（对于测试文件或未知扩展名）
      result = await parseCSVFile(file)
    }
  } catch (error) {
    console.error('File parsing error:', error)
    return {
      dishes: [],
      errors: [{ row: 1, field: 'file', message: `文件解析失败: ${error instanceof Error ? error.message : '未知错误'}` }],
      warnings: [],
      metadata: {
        totalRows: 0,
        validRows: 0,
        fileSize: file.size,
        parseTime: Date.now() - startTime,
      },
    }
  }

  // 验证必需字段
  const requiredFields = ['name', 'price', 'type'] as const
  
  if (result.dishes.length > 0) {
    // 检查是否找到了必需字段
    const firstRow = result.dishes[0]
    if (firstRow) {
      const missingFields = requiredFields.filter(field => {
        if (field === 'name') return !firstRow.name
        if (field === 'price') return !firstRow.price
        if (field === 'type') return !firstRow.type
        return false
      })
      
      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(field => FIELD_MAPPINGS[field][0]).join('、')
        result.errors.unshift({
          row: 1,
          field: 'header',
          message: `缺少必需字段：${missingFieldNames}`
        })
      }
    }
  }

  // 添加字段发现警告
  const warnings: string[] = []
  if (result.dishes.length > 0) {
    const sampleDish = result.dishes[0]
    if (sampleDish) {
      if (!sampleDish.temperature) warnings.push('未找到"温度"字段，将使用默认值')
      if (!sampleDish.meatType) warnings.push('未找到"荤素"字段，将使用默认值')
      if (!sampleDish.tags || sampleDish.tags.length === 0) warnings.push('未找到"标签"字段，将使用默认值')
    }
  }

  result.warnings = warnings
  result.metadata.parseTime = Date.now() - startTime

  return result
}