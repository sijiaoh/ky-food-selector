import type { ParsedFileData, Dish } from '@/types'

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
  
  // 跳过标题行，从第二行开始处理
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]?.trim()
    if (!row) continue
    
    const columns = row.split(',').map(col => col.trim())
    
    if (columns.length < 8) {
      errors.push({
        row: i + 1,
        field: 'row',
        message: `行数据不完整，期望8列，实际${columns.length}列`,
      })
      continue
    }
    
    const [name, priceStr, type, temperature, meatType, tagsStr, baseQuantityStr, scaleWithPeopleStr] = columns
    
    if (!name) {
      errors.push({ row: i + 1, field: 'name', message: '菜名不能为空' })
      continue
    }
    
    const price = Number(priceStr)
    if (isNaN(price) || price <= 0) {
      errors.push({ row: i + 1, field: 'price', message: '价格必须是大于0的数字' })
      continue
    }
    
    const dish: Dish = {
      id: `dish_${Date.now()}_${i}`,
      name,
      price,
      type: type as Dish['type'],
      temperature: temperature === '无' ? '无' : temperature as Dish['temperature'],
      meatType: meatType === '无' ? '无' : meatType as Dish['meatType'],
      tags: tagsStr ? tagsStr.split(' ').filter(tag => tag.trim()) : [],
      baseQuantity: Number(baseQuantityStr) || 1,
      scaleWithPeople: scaleWithPeopleStr === 'Yes',
    }
    
    dishes.push(dish)
  }
  
  return {
    dishes,
    errors,
    warnings: [],
    metadata: {
      totalRows: lines.length,
      validRows: dishes.length,
      fileSize: file.size,
      parseTime: Date.now() - startTime,
    },
  }
}