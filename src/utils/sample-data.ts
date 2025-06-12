// 基于docs/menu_excel_example.md的示例数据
export const SAMPLE_CSV_DATA = `菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
白米饭,3,主食,热,素,"米饭,主食",1,Yes
红烧肉,38,主菜,热,荤,猪肉 红烧 下饭,1,No
麻婆豆腐,22,副菜,热,素,"豆腐,川菜,素食",1,No
紫菜蛋花汤,15,汤,热,素,紫菜 鸡蛋 汤品,1,Yes
绿豆沙,8,点心,冷,素,"绿豆,甜品,消暑",1,No
可乐鸡翅,35,主菜,热,荤,鸡翅 可乐 家常,1,No
蒸蛋羹,12,副菜,热,素,鸡蛋 嫩滑 营养,1,No`

export function downloadSampleFile() {
  const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'ky-dishes-sample.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}