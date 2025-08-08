// API endpoints
export const API_ENDPOINTS = {
  CADETS: '/cadets',
  SCORES: '/scores',
  ACHIEVEMENTS: '/achievements',
  NEWS: '/news',
  TASKS: '/tasks',
} as const;

// Cache keys
export const CACHE_KEYS = {
  CADETS: 'cadets',
  USER_PROFILE: 'user_profile',
  ACHIEVEMENTS: 'achievements',
  NEWS: 'news',
  TASKS: 'tasks',
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Image sizes for optimization
export const IMAGE_SIZES = {
  AVATAR_SMALL: { width: 40, height: 40 },
  AVATAR_MEDIUM: { width: 80, height: 80 },
  AVATAR_LARGE: { width: 160, height: 160 },
  CARD_IMAGE: { width: 400, height: 300 },
  HERO_IMAGE: { width: 1200, height: 600 },
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Default values
export const DEFAULTS = {
  AVATAR_URL: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
  ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  VIRTUAL_LIST_ITEM_HEIGHT: 120,
  VIRTUAL_LIST_OVERSCAN: 3,
} as const;
// Performance settings
export const PERFORMANCE = {
  ENABLE_VIRTUALIZATION: true,
  ENABLE_WEB_WORKERS: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_LAZY_LOADING: true,
  MAX_CONCURRENT_REQUESTS: 6,
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: false,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PWA: false,
} as const;