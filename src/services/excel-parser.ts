import type { ParsedFileData } from '@/types'

export async function parseExcelFile(file: File): Promise<ParsedFileData> {
  const startTime = Date.now()
  
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