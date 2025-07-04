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

## 测试驱动开发(TDD)工作流程

### 核心开发原则
**🔴 RED → 🟢 GREEN → 🔵 REFACTOR**

1. **先写测试，再写代码**: 任何功能开发都必须遵循测试驱动开发流程
2. **循序渐进**: 不允许一步到位开发复杂功能，必须拆分为小步骤
3. **每次通过测试后考虑提交**: 每个绿色(通过)的测试都是一个潜在的提交点

### TDD 开发流程
```typescript
// TDD 工作流程定义
interface TDDWorkflow {
  phase: 'RED' | 'GREEN' | 'REFACTOR';
  description: string;
  actions: string[];
  commitConsideration: boolean;
}

const tddCycle: TDDWorkflow[] = [
  {
    phase: 'RED',
    description: '编写失败的测试',
    actions: [
      '明确需求和预期行为',
      '编写最小化的失败测试',
      '确保测试失败原因正确',
      '运行测试套件确认红色状态'
    ],
    commitConsideration: false
  },
  {
    phase: 'GREEN',
    description: '编写最少代码使测试通过',
    actions: [
      '实现最简单的解决方案',
      '不考虑优雅性，只求通过测试',
      '运行测试确认绿色状态',
      '运行完整测试套件确保无回归'
    ],
    commitConsideration: true // 🟢 考虑提交点
  },
  {
    phase: 'REFACTOR',
    description: '重构代码保持测试通过',
    actions: [
      '优化代码结构和可读性',
      '消除重复代码',
      '改善变量和函数命名',
      '持续运行测试确保绿色状态'
    ],
    commitConsideration: true // 🟢 考虑提交点
  }
];
```

### 渐进式开发策略
```typescript
// 功能拆分原则
interface FeatureBreakdown {
  feature: string;
  complexity: 'simple' | 'medium' | 'complex';
  steps: Array<{
    stepName: string;
    testDescription: string;
    implementation: string;
    estimatedTime: string;
  }>;
}

// 示例：菜品生成器功能拆分
const dishGeneratorBreakdown: FeatureBreakdown = {
  feature: '菜品生成器',
  complexity: 'complex',
  steps: [
    {
      stepName: '基础数据验证',
      testDescription: '验证输入的菜品数据格式正确',
      implementation: '实现基础的 Dish 接口验证',
      estimatedTime: '30分钟'
    },
    {
      stepName: '简单预算过滤',
      testDescription: '根据预算过滤超出价格的菜品',
      implementation: '实现价格范围过滤逻辑',
      estimatedTime: '45分钟'
    },
    {
      stepName: '基础类型搭配',
      testDescription: '生成包含主食、主菜、副菜的基础搭配',
      implementation: '实现类型分组和基础选择逻辑',
      estimatedTime: '60分钟'
    }
    // ... 更多步骤
  ]
};
```

### Git 提交策略与时机
```bash
# 提交时机判断
## ✅ 建议提交的情况
- 测试从红色变为绿色 (功能完成)
- 重构完成且所有测试仍然通过
- 添加了新的测试用例且通过
- 修复了一个具体的 bug 且有测试覆盖
- 完成了一个完整的 TDD 循环

## ❌ 不建议提交的情况  
- 测试仍然是红色状态
- 重构进行到一半
- 代码存在明显的临时 hack
- 测试覆盖率下降
- TypeScript 类型检查失败

# 提交信息规范
feat: 实现菜品价格过滤基础功能

- ✅ 添加价格范围验证测试
- ✅ 实现基础价格过滤算法  
- ✅ 所有测试通过，覆盖率保持 >85%

# Git提交规范
**🚨 重要：Git提交命令中严禁使用双引号(")，只能使用单引号(')！**
**🚨 禁止使用HEREDOC语法，必须使用简单的单引号格式！**

# 提交前检查清单
npm run test        # 所有测试必须通过
npm run typecheck   # 类型检查必须通过
npm run lint        # 代码规范检查必须通过

# 正确的提交命令格式
git commit -m 'feat: 实现菜品价格过滤功能'  # ✅ 正确：使用单引号
git commit -m "feat: 实现菜品价格过滤功能"  # ❌ 错误：禁止使用双引号
git commit -m "$(cat <<'EOF'...)"           # ❌ 错误：禁止使用HEREDOC

# 多行提交信息的正确格式
git commit -m 'feat: 实现菜品价格过滤功能

- 添加价格范围验证测试
- 实现基础价格过滤算法
- 所有测试通过，覆盖率保持 >85%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>'
```

### 微步骤开发示例
```typescript
// 示例：实现菜品筛选功能的微步骤

// 🔴 步骤1: 写最简单的测试
describe('菜品筛选器', () => {
  it('应该返回空数组当没有菜品时', () => {
    const result = filterDishesByBudget([], 100);
    expect(result).toEqual([]);
  });
});

// 🟢 步骤1: 实现最简单的代码
function filterDishesByBudget(dishes: Dish[], budget: number): Dish[] {
  return [];
}
// ✅ 提交点: 'feat: 实现菜品筛选器基础结构'

// 🔴 步骤2: 添加实际筛选测试  
it('应该返回价格在预算内的菜品', () => {
  const dishes = [
    { id: '1', name: '菜A', price: 50, type: '主菜' },
    { id: '2', name: '菜B', price: 150, type: '主菜' }
  ];
  const result = filterDishesByBudget(dishes, 100);
  expect(result).toEqual([dishes[0]]);
});

// 🟢 步骤2: 实现实际筛选逻辑
function filterDishesByBudget(dishes: Dish[], budget: number): Dish[] {
  if (dishes.length === 0) return [];
  return dishes.filter(dish => dish.price <= budget);
}
// ✅ 提交点: 'feat: 添加按预算筛选菜品功能'

// 🔵 步骤3: 重构改善代码质量 (如果需要)
// ✅ 提交点: 'refactor: 优化菜品筛选逻辑可读性'
```

### 测试先行检查清单
- [ ] 📋 **需求明确**: 每个功能开发前先明确输入、输出和边界条件
- [ ] 🔴 **红色测试**: 先写失败的测试，确认测试能够正确失败
- [ ] 🟢 **绿色实现**: 用最简单的方式让测试通过
- [ ] 🔄 **小步迭代**: 每次只解决一个小问题，避免大跳跃
- [ ] ✅ **提交考虑**: 每次测试通过后考虑是否应该提交
- [ ] 🔧 **重构优化**: 在绿色状态下重构，保持测试通过
- [ ] 📊 **覆盖率保持**: 确保测试覆盖率不下降

## 开发注意事项
1. **必须参考需求文档**: 每次开发前查看 `docs/` 目录
2. **随时参照项目概括**: 开发期间持续参考 `PROJECT_OVERVIEW.md` 了解项目现状、技术债务和设计决策
3. **测试驱动开发**: 严格遵循 TDD 流程，先写测试再写代码
4. **循序渐进原则**: 禁止一步到位开发，必须拆分为小步骤
5. **提交时机判断**: 每次测试通过后评估是否应该提交
6. **简洁代码**: 避免重复和不必要的值检测
7. **JSON为主**: 内部逻辑和测试都以JSON数据为主
8. **自我进化**: 代码应该具备根据需要自我更新的能力

### 📋 开发工作流程
```typescript
// 标准开发流程
interface DevelopmentWorkflow {
  preparation: string[];
  development: string[];
  completion: string[];
}

const standardWorkflow: DevelopmentWorkflow = {
  preparation: [
    '1. 阅读 docs/ 目录了解具体需求',
    '2. 查看 dev-docs/PROJECT_OVERVIEW.md 了解项目现状',
    '3. 检查当前技术债务和已知问题',
    '4. 确认开发任务优先级和复杂度'
  ],
  development: [
    '1. 遵循 TDD 红绿重构循环',
    '2. 参考 dev-docs/PROJECT_OVERVIEW.md 中的设计决策',
    '3. 避免重复已知的技术债务',
    '4. 每个功能完成后考虑提交'
  ],
  completion: [
    '1. 更新 dev-docs/PROJECT_OVERVIEW.md 开发进度',
    '2. 记录新的设计决策和技术债务',
    '3. 运行完整测试套件确保质量',
    '4. 更新文档时间戳和版本信息'
  ]
};
```

### 🔍 dev-docs/PROJECT_OVERVIEW.md 使用指南
**在以下情况下必须查看 dev-docs/PROJECT_OVERVIEW.md：**

- **开始新功能开发前**: 了解当前进度和相关技术背景
- **遇到技术问题时**: 查看已知技术债务和解决方案
- **做架构决策时**: 参考已有的关键设计决策记录
- **重构代码时**: 确保不重复现有的改进计划
- **调试问题时**: 查看常见问题解决方案和维护备注

## 文档维护自动化
**在每次重要开发工作后，必须更新以下文档以确保信息同步：**

### 自动更新 CLAUDE.md
- **触发时机**: 添加新的技术栈、修改核心架构、更新开发规范时
- **更新内容**: 技术栈版本、架构设计、开发命令、数据模型、代码规范
- **更新方式**: 直接编辑对应章节，保持配置文件的准确性

### 自动更新 dev-docs/PROJECT_OVERVIEW.md  
- **触发时机**: 完成新功能、修复重要问题、重构关键模块时
- **更新内容**: 
  - 开发进度状态 (✅/⚠️/❌)
  - 技术债务和改进点
  - 关键设计决策记录
  - 下一阶段开发计划
  - 最后更新时间和版本号
- **更新方式**: 
  ```typescript
  // 更新进度示例
  - ✅ **约束条件配置**: 完整的表单组件、实时验证、预设保存
  - ✅ **智能生成算法**: 贪心算法 + 动态规划，O(n log n)复杂度
  - ⚠️ **结果交互**: 生成结果展示（已完成）、手动调整（开发中）
  ```

### 文档同步检查清单
- [ ] 新功能完成后更新 dev-docs/PROJECT_OVERVIEW.md 进度状态
- [ ] 架构变更后更新 CLAUDE.md 技术栈和数据模型
- [ ] 重要设计决策后添加到 dev-docs/PROJECT_OVERVIEW.md 决策记录
- [ ] 技术债务变化后更新改进计划
- [ ] 每次重要提交后更新最后更新时间

**目标**: 确保任何接手项目的开发者都能通过这两个文档快速了解项目现状和技术细节。

## 文档管理原则

### 📚 文档分类与更新策略

#### ❌ **严禁擅自更新 `docs/` 用户文档**
- **定位**: 面向最终用户的简洁文档
- **更新原则**: 需经过明确需求确认才可更新
- **内容要求**: 保持最低限度信息，避免技术细节
- **目标用户**: 普通用户，精力有限，需要快速获取核心信息

#### ✅ **随时更新 `dev-docs/` 开发者文档** 
- **定位**: 面向开发者的详细技术文档
- **更新原则**: 开发过程中随需更新
- **内容包含**: 
  - 功能规范和测试用例
  - 架构设计和技术决策  
  - 开发进度和项目概况
  - 实现细节和技术债务
- **目标用户**: 开发者，需要完整技术信息

#### 📂 **文档目录结构**
```
docs/                    # 用户文档（谨慎更新）
├── README.md           # 文档导航
├── index.md            # 功能说明
├── menu_excel_example.md   # 使用示例
└── preset-configurations.md # 简洁使用指南

dev-docs/               # 开发者文档（随需更新）  
├── README.md           # 开发文档导航
├── PROJECT_OVERVIEW.md # 项目概况和进度
└── feature-specifications.md # 详细功能规范
```

#### 🔄 **文档同步策略**
- **用户文档更新**: 仅在功能正式发布或重大变更时更新
- **开发者文档更新**: 每次功能完成、架构变更、重要决策时更新
- **更新触发**: 开发者文档更新不需要额外确认，用户文档更新需要明确指示

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