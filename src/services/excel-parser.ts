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
        message: `行数据不完整，期望至少8列，实际${columns.length}列`,
      })
      continue
    }
    
    // 处理标签可能跨越多列的情况
    const name = columns[0]
    const priceStr = columns[1]
    const type = columns[2]
    const temperature = columns[3]
    const meatType = columns[4]
    
    // 从第6列开始到倒数第2列都可能是标签
    const baseQuantityStr = columns[columns.length - 2]
    const scaleWithPeopleStr = columns[columns.length - 1]
    
    // 标签部分：从第6列到倒数第3列
    const tagColumns = columns.slice(5, columns.length - 2)
    const tagsStr = tagColumns.join(',') // 重新组合标签
    
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
    
    const dish: Dish = {
      id: `dish_${Date.now()}_${i}`,
      name,
      price,
      type: type as Dish['type'],
      ...(temperature && temperature !== '无' && { temperature: temperature as Dish['temperature'] }),
      ...(meatType && meatType !== '无' && { meatType: meatType as Dish['meatType'] }),
      tags,
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