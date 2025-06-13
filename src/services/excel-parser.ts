import type { ParsedFileData, Dish } from '@/types'
import { parseCSVLine } from '@/utils/csv-parser'

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
        parseTime: Date.now() - startTime,
      },
    }
  }
  
  const dishes: Dish[] = []
  const errors: Array<{ row: number; field: string; message: string }> = []
  const warnings: string[] = []
  
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
      warnings,
      metadata: {
        totalRows: lines.length,
        validRows: 0,
        fileSize: file.size,
        parseTime: Date.now() - startTime,
      },
    }
  }
  
  const headers = parseCSVLine(headerLine)
  
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
  
  // 验证必需字段
  const requiredFields = ['name', 'price', 'type'] as const
  const missingFields = requiredFields.filter(field => columnIndexes[field] === -1)
  
  if (missingFields.length > 0) {
    const missingFieldNames = missingFields.map(field => FIELD_MAPPINGS[field][0]).join('、')
    errors.push({
      row: 1,
      field: 'header',
      message: `缺少必需字段：${missingFieldNames}`
    })
    return {
      dishes: [],
      errors,
      warnings,
      metadata: {
        totalRows: lines.length,
        validRows: 0,
        fileSize: file.size,
        parseTime: Date.now() - startTime,
      },
    }
  }
  
  // 添加字段发现警告
  Object.entries(columnIndexes).forEach(([field, index]) => {
    if (index === -1 && !requiredFields.includes(field as any)) {
      const fieldName = FIELD_MAPPINGS[field as keyof typeof FIELD_MAPPINGS][0]
      warnings.push(`未找到"${fieldName}"字段，将使用默认值`)
    }
  })
  
  // 从第二行开始处理数据
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]?.trim()
    if (!row) continue
    
    const columns = parseCSVLine(row)
    
    // 基于字段索引获取数据
    const name = columnIndexes.name >= 0 ? columns[columnIndexes.name] : ''
    const priceStr = columnIndexes.price >= 0 ? columns[columnIndexes.price] : ''
    const type = columnIndexes.type >= 0 ? columns[columnIndexes.type] : ''
    const temperature = columnIndexes.temperature >= 0 ? columns[columnIndexes.temperature] : ''
    const meatType = columnIndexes.meatType >= 0 ? columns[columnIndexes.meatType] : ''
    const tagsStr = columnIndexes.tags >= 0 ? columns[columnIndexes.tags] : ''
    const baseQuantityStr = columnIndexes.baseQuantity >= 0 ? columns[columnIndexes.baseQuantity] : '1'
    const scaleWithPeopleStr = columnIndexes.scaleWithPeople >= 0 ? columns[columnIndexes.scaleWithPeople] : 'No'
    
    if (!name) {
      errors.push({ row: i + 1, field: 'name', message: '菜名不能为空' })
      continue
    }
    
    const price = Number(priceStr)
    if (isNaN(price) || price <= 0) {
      errors.push({ row: i + 1, field: 'price', message: '价格必须是大于0的数字' })
      continue
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
      id: `dish_${Date.now()}_${i}`,
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
    
    dishes.push(dish)
  }
  
  return {
    dishes,
    errors,
    warnings,
    metadata: {
      totalRows: lines.length,
      validRows: dishes.length,
      fileSize: file.size,
      parseTime: Date.now() - startTime,
    },
  }
}