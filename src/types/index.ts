export interface Dish {
  id: string;
  name: string;
  price: number;
  type: '主食' | '主菜' | '副菜' | '汤' | '点心';
  temperature?: '热' | '冷' | '无' | undefined;
  meatType?: '荤' | '素' | '无' | undefined;
  tags: string[];
  baseQuantity: number;
  scaleWithPeople: boolean;
  description?: string | undefined;
  allergens?: string[] | undefined;
  spicyLevel?: 1 | 2 | 3 | 4 | 5 | undefined;
  cookingTime?: number | undefined;
  popularity?: number | undefined;
}

export interface Constraints {
  headcount: number;
  budget: number;
  typeDistribution: Partial<Record<Dish['type'], number>>;
  temperatureDistribution: Partial<Record<NonNullable<Dish['temperature']>, number>>;
  meatDistribution: Partial<Record<NonNullable<Dish['meatType']>, number>>;
  tagRequirements: Record<string, number>;
  excludedTags: string[];
  excludedAllergens?: string[];
  maxSpicyLevel?: number;
  maxCookingTime?: number;
  preferPopular?: boolean;
}

export interface GenerationResult {
  dishes: Array<{
    dish: Dish;
    quantity: number;
    totalPrice: number;
    isFixed: boolean;
    canReplace: boolean;
    alternatives?: Dish[];
  }>;
  totalCost: number;
  metadata: {
    generationTime: number;
    algorithmVersion: string;
    satisfiedConstraints: string[];
    warnings: string[];
  };
}

export interface ManualAdjustment {
  type: 'fix' | 'replace' | 'remove';
  dishId: string;
  newDish?: Dish;
}

export interface ParsedFileData {
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

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

export type TestLevel = 'unit' | 'integration' | 'e2e' | 'performance' | 'security';

export interface TestStrategy {
  level: TestLevel;
  coverage: number;
  tools: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}