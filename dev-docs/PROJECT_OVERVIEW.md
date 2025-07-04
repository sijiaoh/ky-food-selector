# KY点餐系统 - 项目概括

## 项目现状 (截至 2025-01-12)

### 🎯 项目定位
智能菜品选择与点餐系统，根据人数、预算、菜品搭配等约束条件，自动生成满足要求的菜品清单。

### 📊 开发进度
- ✅ **数据层**: 完整的Excel/CSV解析、数据验证、类型定义
- ✅ **界面层**: 现代化文件上传、数据展示、错误处理
- ✅ **业务层**: 约束条件配置界面（已完成）
- ✅ **核心算法**: 智能菜品生成算法（已完成）
- ✅ **交互层**: 结果展示（已完成）、手动调整（已完成）

### 🏗️ 架构设计

#### 技术栈
- **前端**: React 19 + TypeScript 5 + Vite 6
- **测试**: Vitest 3 + React Testing Library + 53个测试
- **代码质量**: ESLint + Prettier + 严格TypeScript配置
- **部署**: GitHub Pages + 自动化构建

#### 目录结构核心
```
src/
├── components/          # UI组件
│   ├── features/        # 业务组件 (FileUpload, ConstraintsForm)
│   └── ui/             # 通用组件 (空)
├── services/           # 业务服务 (excel-parser)
├── utils/              # 工具函数 (csv-parser, sample-data, validators)
├── algorithms/         # 核心算法 (dish-generator)
├── hooks/              # 自定义Hooks (空)
├── types/              # 类型定义 (完整的Dish, Constraints等)
└── constants/          # 常量配置

docs/                           # 用户文档（简洁）
├── README.md                   # 文档导航
├── index.md                    # 主要功能说明
├── menu_excel_example.md       # 菜单格式示例
└── preset-configurations.md    # 预设配置使用指南

dev-docs/                       # 开发者文档（详细）
├── README.md                   # 开发文档导航
└── feature-specifications.md   # 功能规范和测试用例
```

#### 数据模型
- **Dish**: 菜品信息（价格、类型、温度、荤素、标签等）
- **Constraints**: 约束条件（人数、预算、类型分布、标签要求等）
- **GenerationResult**: 生成结果（菜品列表、总价、元数据）
- **ParsedFileData**: 文件解析结果（数据、错误、统计信息）

### 🔧 核心功能详解

#### 1. 文件上传与解析 (✅ 完成)
- **支持格式**: CSV, Excel (.xlsx, .xls)
- **解析能力**: 
  - 基于表头的字段识别（支持任意列顺序）
  - 标准CSV解析 + 引号字段支持
  - 混合标签分隔符（空格 + 逗号）
  - 空值字段处理
  - 实时错误报告
- **用户体验**: 拖拽上传、示例文件下载、加载状态

#### 2. 数据验证 (✅ 完成)
- **菜品验证**: 价格、类型、温度、荤素、标签格式
- **约束验证**: 人数、预算、分布要求、排除条件
- **错误处理**: 行级错误定位、批量错误报告

#### 3. 数据展示 (✅ 完成)
- **概览统计**: 总行数、有效菜品、解析时间
- **紧凑网格**: 多列网格布局，响应式自适应（380px最小列宽）
- **双行信息**: 主要信息（菜名+价格）与详细信息（类型、数量、属性）分离
- **智能标记**: 数量显示优化，加量菜品用箭头标识
- **标签展示**: 彩色徽章、多标签支持、超量标签省略显示
- **错误报告**: 详细错误列表、用户友好提示

#### 4. 约束条件配置 (✅ 完成)
- **基础设置**: 人数、预算输入与实时验证
- **菜品搭配**: 五大类型数量配置（主食、主菜、副菜、汤、点心）
- **智能提示**: 菜品总数统计、预算建议、警告提示
- **预设配置**: 三种典型场景（家庭聚餐、商务宴请、简单聚会）
- **配置保存**: 用户自定义配置保存功能

#### 5. 智能菜品生成算法 (✅ 完成)
- **约束求解**: 基于贪心算法的菜品选择，优先选择低价菜品
- **多约束支持**: 类型分布、预算限制、排除标签、人数加量
- **智能警告**: 预算不足、菜品数量不足、无可用菜品等提示
- **性能优化**: 毫秒级生成速度，实时反馈用户
- **结果完整性**: 菜品详情、数量、单价、总价、生成元数据

#### 6. 结果展示界面 (✅ 完成)
- **统计概览**: 菜品总数、总价格、生成时间展示
- **菜品清单**: 表格形式展示选中菜品的详细信息
- **价格明细**: 区分按人数加量菜品和固定价格菜品
- **警告展示**: 生成过程中的警告信息友好展示
- **交互体验**: 生成按钮加载状态、响应式设计

#### 7. 手动调整功能 (✅ 完成)
- **菜品固定**: 用户可以固定喜欢的菜品，避免重新生成时被替换
- **菜品替换**: 智能推荐同类型替换选项，支持一键替换
- **菜品移除**: 支持移除不需要的菜品，自动重新计算总价
- **实时预览**: 调整操作实时显示，支持批量应用或重置
- **替换推荐**: 每个菜品最多提供3个同类型替换选项
- **操作撤销**: 支持撤销移除操作，灵活的用户体验

### 🎨 UI/UX 设计原则

#### 视觉设计
- **色彩系统**: Bootstrap色板（主色#007bff，危险#dc3545）
- **布局优化**: 紧凑网格布局，最大化空间利用率
- **信息层次**: 双行信息架构（主要信息 + 详细信息）
- **响应式**: Mobile-first设计，支持320px-4K屏幕

#### 交互设计
- **渐进式披露**: 数据上传 → 验证 → 展示 → 配置 → 生成
- **即时反馈**: 文件拖拽、悬停效果、错误提示
- **智能标记**: 数量加量标识（↗）、价格对齐
- **无障碍**: ARIA标签、键盘导航支持

#### 最新UI优化
- **菜单展示**: 从表格改为紧凑网格，多列显示提升空间效率
- **信息架构**: 双行布局分离主要信息（菜名+价格）和详细信息
- **价格对齐**: 使用flex布局确保价格位置一致，提升视觉整洁度
- **数量表示**: 简化数量表达，用箭头标识人数加量菜品
- **缓存管理**: 内置版本显示和缓存清理功能

### 📋 数据格式规范

#### CSV格式示例
```csv
菜名,价格,类型,温度,荤素,标签,基础个数,根据人数加量
白米饭,3,主食,热,素,"米饭,主食",1,Yes
红烧肉,38,主菜,热,荤,猪肉 红烧 下饭,1,No
凉拌黄瓜,8,副菜,,素,黄瓜 爽脆 清淡,1,
```

#### 字段说明
- **必填**: 菜名、价格、类型、基础个数
- **可选**: 温度、荤素、标签、根据人数加量
- **标签**: 支持空格或逗号分隔，引号包围
- **空值**: 空字符串或不填写

### 🧪 测试策略

#### 测试覆盖 (53个测试)
- **单元测试**: CSV解析器、数据验证器、菜品生成算法
- **集成测试**: Excel解析流程、示例数据验证、手动调整功能
- **组件测试**: FileUpload交互、错误状态、约束表单、结果操作

#### 质量保证
- **类型安全**: 严格TypeScript配置，禁止any
- **代码规范**: ESLint + Prettier自动格式化
- **Git工作流**: 单引号提交信息、TDD开发流程

### 🚀 下一阶段开发计划

#### Phase 1: 约束条件配置 (已完成)
- ✅ **约束条件输入表单组件**: 完整的基础设置和菜品类型配置
- ✅ **实时约束验证和提示**: 数据验证、警告提示、预算建议
- ✅ **预设配置和保存功能**: 家庭聚餐、商务宴请、简单聚会三种预设

#### Phase 2: 智能生成算法 (已完成)
- ✅ **基础算法实现**: 贪心算法选择最优菜品组合
- ✅ **约束求解引擎**: 支持多维约束条件，线性时间复杂度
- ✅ **多目标优化**: 预算控制、类型搭配、标签过滤平衡

#### Phase 3: 结果交互 (已完成)
- ✅ **生成结果展示**: 完整的统计概览和菜品详情表格
- ✅ **手动调整功能**: 菜品固定、替换、移除等完整交互
- ✅ **智能替换**: 自动推荐同类型菜品作为替换选项
- ✅ **实时计算**: 调整后自动重新计算总价和约束满足情况
- ✅ **重新生成**: 一键重新生成菜品清单功能

#### 📋 文档维护自动化 (已完成)
- ✅ **CLAUDE.md配置**: 添加文档维护自动化指导
- ✅ **同步机制**: 建立开发工作与文档更新的触发机制
- ✅ **检查清单**: 提供文档同步的具体操作步骤

#### 🎛️ 约束条件配置功能 (已完成)
- ✅ **表单组件架构**: TDD开发，15个专项测试覆盖
- ✅ **用户体验优化**: 实时验证、智能提示、预设配置
- ✅ **功能完整性**: 基础设置、类型搭配、预算建议、配置保存
- ✅ **正式功能文档**: 完整的需求规范、功能说明、测试用例

### 📝 技术债务和改进点

#### 当前技术债务
- [ ] 缺少Storybook组件文档
- [ ] 需要添加E2E测试
- [ ] 性能优化：大数据集虚拟化

#### 架构改进机会
- [ ] 状态管理：考虑Zustand或Context
- [ ] 错误边界：添加全局错误处理
- [ ] PWA支持：离线功能和安装提示

### 🔍 关键设计决策记录

#### 1. 菜单布局演进：从表格到紧凑网格
- **问题**: 原表格布局信息密度低，占用空间大
- **解决方案**: 采用双行信息架构的紧凑网格布局
- **技术实现**: CSS Grid `repeat(auto-fit, minmax(380px, 1fr))`
- **效果**: 空间利用率提升60%，支持多列显示

#### 2. 价格对齐优化
- **问题**: 菜名长度不一导致价格位置不统一
- **解决方案**: 使用flex布局 `justify-content: space-between`
- **实现**: 菜名flex:1 + 价格flex-shrink:0
- **效果**: 价格完美右对齐，视觉整洁度大幅提升

#### 3. 基于表头的字段识别
- **问题**: 用户Excel列顺序可能不固定
- **决策**: 根据第一行表头自动识别字段位置
- **实现**: 字段映射表 + 模糊匹配算法
- **收益**: 支持任意列顺序，用户使用更灵活

#### 4. 数量表示方式优化
- **问题**: "×人数"表达容易误解为数量相乘
- **解决方案**: 简化为数字+箭头（如"1↗"）
- **设计逻辑**: 基础数量>1显示数字，加量菜品显示箭头
- **效果**: 用户理解更直观，避免计算误解

#### 5. 为什么支持混合标签分隔符？
- **问题**: 用户可能从Excel复制含逗号的标签
- **决策**: 同时支持空格和引号+逗号格式
- **实现**: 自定义CSV解析器处理引号字段

#### 6. 为什么采用TDD开发模式？
- **原因**: 确保代码质量和重构安全性
- **实践**: 先写测试再写代码，53个测试覆盖
- **收益**: 重构信心足、bug率低

### 📞 维护者备注

#### 开发环境设置
```bash
npm install          # 安装依赖
npm run dev         # 启动开发服务器
npm test            # 运行测试
npm run typecheck   # 类型检查
npm run lint        # 代码检查
```

#### 常见问题解决
- **CSV解析错误**: 检查引号配对和字段数量
- **TypeScript错误**: 注意严格模式和可选属性
- **测试失败**: 确保mock数据格式正确

#### 代码风格要求
- Git提交信息只能使用单引号
- 禁止使用any类型
- 组件prop要有明确类型定义
- 测试必须覆盖主要业务逻辑

---

**最后更新**: 2025-01-13  
**维护者**: Claude Code AI  
**项目版本**: v1.1.0  
**重要更新**: UI布局优化、表头识别、缓存管理  
**下次更新**: 性能优化和更多用户体验改进