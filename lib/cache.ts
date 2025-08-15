interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private prefix = 'rangaone_cache_';

  set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    if (typeof window === 'undefined') return;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const cached: CacheItem<T> = JSON.parse(item);
      
      if (Date.now() > cached.expiry) {
        this.remove(key);
        return null;
      }
      
      return cached.data;
    } catch (e) {
      console.warn('Cache retrieval failed:', e);
      return null;
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  // State management for UI components
  setState(key: string, state: any): void {
    this.set(`state_${key}`, state, 60); // 1 hour TTL for UI state
  }

  getState<T>(key: string): T | null {
    return this.get<T>(`state_${key}`);
  }
}

export const cache = new CacheManager();