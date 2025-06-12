# KY点餐 - ClaudeCode配置

## 重要提醒
**在开始任何开发工作之前，必须阅读并参考 `docs/` 目录下的需求文档。所有功能实现都必须严格按照需求文档执行。**

## 项目概述
KY点餐是一个基于React和TypeScript的网页应用，用于自动化菜品选择和点餐。根据人数、预算、菜品搭配等条件，自动生成满足要求的菜品清单。

## 技术栈
- **前端框架**: React 18+ + TypeScript
- **构建工具**: Vite
- **测试框架**: Vitest + React Testing Library
- **样式方案**: CSS Modules 或 Styled Components
- **部署平台**: GitHub Pages
- **数据格式**: JSON（Excel仅用于数据上传）

## 核心功能
- Excel菜品数据文件上传
- 交互式约束条件配置
- 智能菜品生成与优化
- 实时预算和约束验证
- 菜品选择的手动调整功能

## 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 部署到GitHub Pages
npm run deploy
```

## 测试策略
- 核心逻辑和组件的单元测试
- 用户工作流的集成测试
- Excel文件上传功能的模拟测试
- 测试数据生成工具
- 测试覆盖率要求：>80%

## 代码规范
- 启用TypeScript严格模式
- 使用ESLint + Prettier配置
- 函数式组件 + Hooks
- 业务逻辑封装为自定义Hook
- 避免过度的prop传递（必要时使用Context）
- 避免不必要的类型断言和any类型

## 数据模型
```typescript
// 菜品数据结构
interface Dish {
  name: string;           // 菜名
  price: number;          // 价格
  type: '主食' | '主菜' | '副菜' | '汤' | '点心';
  temperature?: '热' | '冷' | '无';     // 温度（可选）
  meatType?: '荤' | '素' | '无';        // 荤素（可选）
  tags: string[];         // 标签列表
  baseQuantity: number;   // 基础个数
  scaleWithPeople: boolean; // 是否根据人数加量
}

// 选择约束条件
interface Constraints {
  headcount: number;      // 人数
  budget: number;         // 预算
  typeDistribution: Partial<Record<Dish['type'], number>>;    // 类型搭配
  temperatureDistribution: Partial<Record<Dish['temperature'], number>>; // 温度搭配
  meatDistribution: Partial<Record<Dish['meatType'], number>>;  // 荤素搭配
  tagRequirements: Record<string, number>;  // 标签要求个数
  excludedTags: string[];  // 排除的标签
}
```

## 自我进化指导
- 监控用户交互并优化选择算法
- 根据使用模式添加新的约束类型
- 基于用户反馈改进UI/UX
- 根据需要扩展数据模型
- 为大型菜品数据集优化性能
- 逐步添加无障碍功能

## 部署配置
- GitHub Actions自动化部署工作流
- 环境特定配置
- 静态资源优化
- Service Worker离线功能（可选）

## 性能要求
- 初始加载时间 < 3秒
- 文件上传处理时间 < 5秒（1000+菜品）
- 菜品生成时间 < 2秒
- 移动端和桌面端响应式设计

## 错误处理
- Excel解析错误的友好提示
- 约束验证反馈
- 网络错误恢复
- 无效数据格式通知

## 开发注意事项
1. **必须参考需求文档**: 每次开发前查看 `docs/` 目录
2. **简洁代码**: 避免重复和不必要的值检测
3. **积极测试**: 所有功能都需要对应的测试用例
4. **JSON为主**: 内部逻辑和测试都以JSON数据为主
5. **自我进化**: 代码应该具备根据需要自我更新的能力

## 外部库使用规范
1. **包管理器安装**: 使用外部库时必须通过包管理器命令安装，不能直接修改package.json文件
   ```bash
   # 安装生产依赖
   npm install <package-name>
   
   # 安装开发依赖
   npm install -D <package-name>
   
   # 卸载依赖
   npm uninstall <package-name>
   ```

2. **库选择标准**: 
   - 优先选择GitHub Star数量 > 1000 的库
   - 优先选择有活跃维护的库（最近6个月内有更新）
   - 优先选择TypeScript支持良好的库
   - 避免使用过于小众或维护不活跃的库

3. **推荐库列表**:
   - **Excel处理**: `xlsx` (>25k stars)
   - **状态管理**: `zustand` (>40k stars) 或 React Context
   - **样式方案**: `styled-components` (>40k stars) 或 CSS Modules
   - **工具库**: `lodash-es` (>58k stars) 或原生JS优先
   - **图标**: `lucide-react` (>8k stars) 或 `react-icons` (>11k stars)
   - **UI组件**: `@headlessui/react` (>24k stars) 或自定义组件优先

4. **库使用原则**:
   - 能用原生JS/TS解决的不使用外部库
   - 新增库前先评估是否真正需要
   - 定期检查依赖更新和安全漏洞
   - 保持依赖数量最小化