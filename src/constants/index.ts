export const DISH_TYPES = ['主食', '主菜', '副菜', '汤', '点心'] as const;
export const TEMPERATURES = ['热', '冷', '无'] as const;
export const MEAT_TYPES = ['荤', '素', '无'] as const;
export const SPICY_LEVELS = [1, 2, 3, 4, 5] as const;

export const MAX_GENERATION_TIME = 2000;
export const DEFAULT_DISH_TYPES = ['主食', '主菜'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['.xlsx', '.xls', '.csv'];

export const ALGORITHM_VERSION = '1.0.0';

export const DEFAULT_CONSTRAINTS: Partial<import('../types').Constraints> = {
  typeDistribution: {
    '主食': 1,
    '主菜': 2,
    '副菜': 1,
    '汤': 1,
  },
  excludedTags: [],
  excludedAllergens: [],
  preferPopular: false,
};

export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  PARSE_ERROR: 'PARSE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  GENERATION_TIMEOUT: 'GENERATION_TIMEOUT',
  INSUFFICIENT_DISHES: 'INSUFFICIENT_DISHES',
} as const;