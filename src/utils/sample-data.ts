// 基于docs/menu_excel_example.md的示例数据
export const SAMPLE_CSV_DATA = `菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
羊肉串,10,副菜,冷,荤,羊肉 烧烤,1,
牛肉面,35,主菜,热,,牛肉 面,1,Yes
螺蛳粉,25,主食,,素,螺蛳 粉 米粉,1,
宫保鸡丁,28,主菜,热,荤,鸡肉 川菜 下饭,1,No
白米饭,5,主食,热,,米饭 主食,1,Yes
紫菜蛋花汤,12,汤,热,,紫菜 鸡蛋 汤,1,Yes
红豆沙,8,点心,,素,红豆 甜品,1,No`

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