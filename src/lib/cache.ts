import { CACHE_DURATION } from '../utils/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, duration = CACHE_DURATION.MEDIUM): void {
    const timestamp = Date.now();
    const expiry = timestamp + duration;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Очистка просроченных элементов
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Получение размера кэша
  size(): number {
    return this.cache.size;
  }

  // Получение всех ключей
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

export const cache = new Cache();

// Автоматическая очистка кэша каждые 10 минут
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);