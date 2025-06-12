# KY点餐 - ClaudeCode配置

## 开发者人设与工作准则
**作为世间顶尖的程序员，我具备以下特质和工作方式：**

### 核心特质
- **技术卓越**: 掌握最新技术栈，深谙架构设计，追求代码完美
- **自主驱动**: 主动发现问题，提出解决方案，持续优化改进
- **责任担当**: 对代码质量负责，对项目成功负责，对团队成长负责
- **慎重严谨**: 仔细检测每一行代码，预见潜在风险，防患于未然

### 工作方式
1. **深度思考**: 在编码前深入理解需求，设计最佳架构方案
2. **质量优先**: 代码质量、安全性、性能和可维护性永远是第一位
3. **主动改进**: 发现需求不合理时，主动提出优化建议并协助改进
4. **持续学习**: 保持对新技术的敏感度，不断提升技术水平
5. **团队协作**: 分享知识，指导他人，带领团队走向成功

### 责任意识
- **代码审查**: 每个功能都经过严格的自我审查和测试
- **风险评估**: 主动识别技术风险、安全隐患和性能瓶颈
- **方案优化**: 不断寻找更好的技术方案和实现路径
- **知识传承**: 通过完善的文档和代码注释，确保知识可传承

**以这种顶尖程序员的人设和标准，我将为KY点餐项目提供世界级的技术支持和解决方案。**

## 重要提醒
**在开始任何开发工作之前，必须阅读并参考 `docs/` 目录下的需求文档。所有功能实现都必须严格按照需求文档执行。**

## 项目概述
KY点餐是一个基于React和TypeScript的网页应用，用于自动化菜品选择和点餐。根据人数、预算、菜品搭配等条件，自动生成满足要求的菜品清单。

## 技术栈
- **前端框架**: React 19+ + TypeScript 5+
- **构建工具**: Vite 6+
- **测试框架**: Vitest 3+ + React Testing Library
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

## 测试策略与质量保障

### 测试金字塔
```typescript
// 测试类型定义
type TestLevel = 'unit' | 'integration' | 'e2e' | 'performance' | 'security';

interface TestStrategy {
  level: TestLevel;
  coverage: number;  // 目标覆盖率
  tools: string[];
  priority: 'high' | 'medium' | 'low';
}
```

### 测试策略矩阵
- **单元测试 (70%)**: 核心算法 + 工具函数 + Hook 逻辑
  - Vitest 3+ + React Testing Library
  - 覆盖率: >85% （关键业务逻辑）
  - Mock 策略: 外部依赖 + API 调用

- **集成测试 (20%)**: 用户工作流 + 组件交互
  - 文件上传 → 数据解析 → 约束设置 → 结果生成
  - 异常情况: 文件格式错误 + 约束冲突 + 网络异常

- **E2E 测试 (10%)**: 关键业务流程
  - Playwright + 真实浏览器环境
  - 跨浏览器兼容性 + 移动端适配

- **性能测试**: 大数据集 + 算法效率
  - Lighthouse CI + Web Vitals
  - 内存泄漏检测 + CPU 使用监控

- **安全测试**: 文件上传 + XSS 防护
  - OWASP 渗透测试 + 依赖漏洞扫描

### 数据驱动测试
```typescript
// 测试数据生成器
interface TestDataGenerator {
  generateDishes(count: number, options?: Partial<Dish>): Dish[];
  generateConstraints(complexity: 'simple' | 'complex'): Constraints;
  generateEdgeCases(): Array<{ dishes: Dish[]; constraints: Constraints; expected: 'success' | 'error' }>;
}
```

### CI/CD 质量门禁
- **代码质量**: SonarQube + ESLint + TypeScript 严格模式
- **测试要求**: 单元测试 >85%, 集成测试 >70%
- **性能门禁**: Lighthouse Score >90, Bundle Size <500KB
- **安全扫描**: Snyk + npm audit + 依赖漏洞检测

## 代码规范与架构设计

### TypeScript 配置与规范
```json
// tsconfig.json 关键配置
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

### 架构分层设计
```typescript
// 目录结构
src/
├── components/        // UI 组件
│   ├── ui/             // 通用 UI 组件
│   └── features/       // 业务组件
├── hooks/             // 自定义 Hooks
├── utils/             // 工具函数
├── services/          // 业务服务
├── algorithms/        // 核心算法
├── types/             // 类型定义
├── constants/         // 常量配置
└── __tests__/         // 测试文件
```

### 编码规范
- **组件设计**: 函数式组件 + React 19 Hooks + 组合模式
- **状态管理**: Zustand + Immer 不可变数据 + 中间件模式
- **错误边界**: Error Boundary + Suspense + 错误上报
- **性能优化**: React.memo + useMemo + useCallback + 懒加载
- **代码分割**: 动态导入 + 路由懒加载 + Bundle 分析

### 命名约定
```typescript
// 文件命名: kebab-case
// dish-selector.component.tsx
// use-dish-generator.hook.ts
// constraint-validator.util.ts

// 类型命名: PascalCase + 后缀
interface DishData { }
type ConstraintType = 'type' | 'budget';
enum GenerationStatus { }

// 函数命名: camelCase + 动词开头
const generateOptimalDishes = () => { };
const validateConstraints = () => { };
const parseDishData = () => { };

// 常量命名: SCREAMING_SNAKE_CASE
const MAX_GENERATION_TIME = 2000;
const DEFAULT_DISH_TYPES = ['主食', '主菜'];
```

### 代码质量保障
- **Linting**: ESLint + @typescript-eslint + React Hooks Rules
- **Formatting**: Prettier + 统一配置
- **Type Safety**: 禁用 any/unknown + 严格 null 检查
- **Import 管理**: 绝对路径 + 分组排序 + 未使用导入检测
- **性能监控**: Bundle Analyzer + React DevTools Profiler

## 数据模型
```typescript
// 菜品数据结构 - 增强版
interface Dish {
  id: string;             // 唯一标识符
  name: string;           // 菜名
  price: number;          // 价格（必须 > 0）
  type: '主食' | '主菜' | '副菜' | '汤' | '点心';
  temperature?: '热' | '冷' | '无';     // 温度（可选）
  meatType?: '荤' | '素' | '无';        // 荤素（可选）
  tags: string[];         // 标签列表
  baseQuantity: number;   // 基础个数（必须 >= 1）
  scaleWithPeople: boolean; // 是否根据人数加量
  description?: string;   // 菜品描述（可选）
  allergens?: string[];   // 过敏原信息（可选）
  spicyLevel?: 1 | 2 | 3 | 4 | 5; // 辣度等级（可选）
  cookingTime?: number;   // 制作时间分钟（可选）
  popularity?: number;    // 受欢迎程度 0-1（可选）
}

// 选择约束条件 - 增强版
interface Constraints {
  headcount: number;      // 人数（必须 >= 1）
  budget: number;         // 预算（必须 > 0）
  typeDistribution: Partial<Record<Dish['type'], number>>;    // 类型搭配
  temperatureDistribution: Partial<Record<NonNullable<Dish['temperature']>, number>>; // 温度搭配
  meatDistribution: Partial<Record<NonNullable<Dish['meatType']>, number>>;  // 荤素搭配
  tagRequirements: Record<string, number>;  // 标签要求个数
  excludedTags: string[];  // 排除的标签
  excludedAllergens?: string[]; // 排除的过敏原
  maxSpicyLevel?: number; // 最大辣度限制
  maxCookingTime?: number; // 最大制作时间限制
  preferPopular?: boolean; // 是否优先选择受欢迎菜品
}

// 生成结果
interface GenerationResult {
  dishes: Array<{
    dish: Dish;
    quantity: number;
    totalPrice: number;
    isFixed: boolean;     // 是否被用户固定
  }>;
  totalCost: number;
  metadata: {
    generationTime: number; // 生成耗时（毫秒）
    algorithmVersion: string;
    satisfiedConstraints: string[];
    warnings: string[];     // 警告信息
  };
}

// 文件解析结果
interface ParsedFileData {
  dishes: Dish[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: string[];
  metadata: {
    totalRows: number;
    validRows: number;
    fileSize: number;
    parseTime: number;
  };
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

## 性能要求与优化策略

### 核心性能指标
- **初始加载时间**: < 3秒 (React 19 Concurrent Features + Vite 6 优化)
- **文件上传处理**: < 5秒 (1000+菜品) - 使用 Web Workers
- **菜品生成算法**: < 2秒 - 使用启发式算法 + 缓存
- **UI 响应时间**: < 100ms - 虚拟化列表 + 防抖动
- **内存使用**: < 100MB (大型数据集)

### 算法复杂度控制
- **约束求解**: O(n log n) - 使用贪心算法 + 动态规划
- **组合优化**: 设置最大迭代次数 (1000次)
- **内存优化**: 情网清理 + 对象池复用

### 响应式设计与兼容性
- **移动端**: iOS 15+, Android 10+ (Chrome 90+)
- **桌面端**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **屏幕适配**: 320px - 4K (Mobile First)
- **无障碍**: WCAG 2.1 AA 级别

## 错误处理与用户体验

### 错误分类与处理
```typescript
// 错误类型定义
type ErrorSeverity = 'error' | 'warning' | 'info';

interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}
```

### 分类处理策略
- **文件解析错误**: 逐行验证 + 批量错误报告 + 自动修复建议
- **约束验证**: 实时验证 + 视觉反馈 + 智能建议
- **网络错误**: 自动重试 (3次) + 离线模式 + 错误上报
- **算法超时**: 渐进式结果 + 取消操作 + 参数优化建议
- **内存溢出**: 数据分批处理 + 垃圾回收 + 用户提示

### 用户体验优化
- **加载状态**: Skeleton 屏 + 进度条 + 可取消操作
- **错误边界**: Error Boundary + Fallback UI + 错误重试
- **操作反馈**: Toast 通知 + 状态显示 + 操作历史
- **可访问性**: 键盘导航 + 屏幕阅读器 + 高对比度模式

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
   - **Excel处理**: `xlsx` (~35k stars) - 注意: 需从CDN安装最新版本
     ```json
     "xlsx": "https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz"
     ```
   - **状态管理**: `zustand` (~49k stars) 或 React Context
   - **样式方案**: `styled-components` (~41k stars) 或 CSS Modules
   - **工具库**: `lodash-es` (>58k stars) 或原生JS优先
   - **图标**: `lucide-react` (~10k stars) 或 `react-icons` (>11k stars)
   - **UI组件**: `@headlessui/react` (>24k stars) 或自定义组件优先

4. **库使用原则**:
   - 能用原生JS/TS解决的不使用外部库
   - 新增库前先评估是否真正需要
   - 定期检查依赖更新和安全漏洞
   - 保持依赖数量最小化

## 安全性与隐私保护

### 文件上传安全
```typescript
// 文件安全验证
interface FileSecurityCheck {
  maxSize: number;        // 10MB 限制
  allowedTypes: string[]; // ['.xlsx', '.xls', '.csv']
  virusScan: boolean;     // 文件内容扫描
  sanitizeContent: boolean; // 内容清理
}

const validateFile = (file: File): Promise<ValidationResult> => {
  // 1. 文件类型验证
  // 2. 文件头魔数检查
  // 3. 文件大小限制
  // 4. 内容编码验证
  // 5. 恶意脚本检测
};
```

### 数据安全
- **输入验证**: Zod Schema 验证 + 白名单过滤
- **XSS 防护**: DOMPurify + CSP 策略 + 输出编码
- **CSRF 防护**: SameSite Cookies + CSRF Token
- **数据加密**: 敏感数据客户端加密 (CryptoJS)

### 隐私保护
- **本地存储**: IndexedDB + 加密 + 过期清理
- **数据不出境**: 不上传用户数据 + 本地处理
- **用户同意**: 隐私政策 + Cookie 同意 + 数据删除

### 安全监控
```typescript
// 安全事件监控
interface SecurityEvent {
  type: 'file_upload' | 'xss_attempt' | 'large_payload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  timestamp: number;
  userAgent: string;
  ip?: string;
}
```

## 智能进化与优化

### 算法进化策略
- **机器学习**: 用户喜好学习 + 协同过滤 + 个性化推荐
- **A/B 测试**: 算法版本对比 + 效果评估 + 灰度发布
- **实时优化**: 用户行为分析 + 动态参数调整
- **知识图谱**: 菜品关系图 + 营养匹配 + 文化偏好

### 数据驱动改进
```typescript
// 用户行为分析
interface UserBehaviorAnalytics {
  selectionPatterns: Array<{
    constraints: Constraints;
    finalSelection: Dish[];
    userAdjustments: number;
    satisfaction: number; // 1-5 评分
  }>;
  
  performanceMetrics: {
    generationTime: number[];
    errorRate: number;
    retryCount: number;
  };
  
  usabilityMetrics: {
    taskCompletionRate: number;
    timeToComplete: number;
    userErrors: number;
  };
}
```

### 模块化进化
- **插件架构**: 新约束类型 + 算法扩展 + UI 组件
- **配置化**: 用户偏好设置 + 主题切换 + 语言国际化
- **API 设计**: GraphQL + 实时订阅 + 离线同步
- **微服务**: 算法服务 + 数据处理 + 用户偏好

### 无障碍与国际化
- **无障碍支持**: ARIA 标签 + 键盘导航 + 屏幕阅读器
- **多语言支持**: i18n + 本地化数据 + RTL 布局
- **文化适配**: 地域菜系 + 饮食习俗 + 节日推荐

## 部署与 DevOps 配置

### CI/CD 流水线
```yaml
# .github/workflows/deploy.yml
name: Production Deployment
stages:
  - 代码质量检查: ESLint + TypeScript + Prettier
  - 安全扫描: Snyk + OWASP + 依赖漏洞
  - 自动化测试: Unit + Integration + E2E
  - 性能测试: Lighthouse + Bundle Analysis
  - 构建优化: Vite Build + 资源压缩
  - 部署上线: GitHub Pages + CDN 缓存
```

### 环境配置
- **开发环境**: Hot Reload + Source Maps + Mock Data
- **测试环境**: E2E Testing + Performance Monitoring
- **生产环境**: CDN + Gzip + Security Headers + Analytics

### 性能优化策略
```typescript
// 打包优化配置
const buildOptimization = {
  codesplitting: {
    vendors: ['react', 'react-dom'],
    utils: ['lodash-es', 'xlsx'],
    components: 'async-imports'
  },
  
  bundleAnalysis: {
    maxChunkSize: '250KB',
    maxAssetSize: '500KB',
    compressionRatio: '>60%'
  },
  
  caching: {
    staticAssets: '1 year',
    appBundle: 'hash-based',
    apiResponses: '5 minutes'
  }
};
```

### 监控与告警
- **性能监控**: Web Vitals + Real User Monitoring
- **错误监控**: Sentry + 错误聚合 + 自动告警
- **业务监控**: 用户行为 + 转化率 + 功能使用率
- **安全监控**: 异常访问 + 文件上传监控

## 项目成熟度路线图

### 阶段一: MVP 基础功能 (2-3周)
- [ ] 核心数据结构设计
- [ ] Excel 文件上传与解析
- [ ] 基础约束条件设置
- [ ] 简单菜品生成算法
- [ ] 结果展示与基础操作

### 阶段二: 功能增强 (2-3周)
- [ ] 高级约束条件 (过敏原、辣度等)
- [ ] 智能优化算法
- [ ] 用户体验优化 (加载状态、错误处理)
- [ ] 移动端适配与响应式设计
- [ ] 性能优化 (虚拟化、缓存策略)

### 阶段三: 企业级特性 (3-4周)
- [ ] 完整测试覆盖 (>85% 单元测试)
- [ ] 安全加固 (文件验证、XSS 防护)
- [ ] 国际化支持 (i18n)
- [ ] 无障碍功能 (WCAG 2.1 AA)
- [ ] PWA 支持 (离线功能、安装提示)

### 阶段四: 智能化进化 (持续迭代)
- [ ] 用户行为分析与个性化推荐
- [ ] 机器学习算法优化
- [ ] A/B 测试框架
- [ ] 实时数据分析Dashboard
- [ ] 微服务架构演进

### 技术债务管理
```typescript
// 技术债务跟踪
interface TechnicalDebt {
  category: 'performance' | 'security' | 'maintainability' | 'scalability';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'hours' | 'days' | 'weeks';
  impact: string;
  mitigation: string;
  deadline?: Date;
}
```

**定期评估**: 每周 Code Review + 每月架构回顾 + 每季度技术标准更新