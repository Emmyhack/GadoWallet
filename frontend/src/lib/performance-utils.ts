/**
 * Performance Optimization Utilities
 * Reduces loading times and improves user experience
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { CacheEntry, FunctionParameters, DependencyList } from '../types';

// Cache for API responses
const cache = new Map<string, CacheEntry>();

/**
 * Cache utility with TTL (Time To Live)
 */
export const cacheUtils = {
  set: <T>(key: string, data: T, ttlSeconds = 300) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  },

  get: (key: string) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },

  clear: () => cache.clear(),
  
  invalidate: (keyPrefix: string) => {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        cache.delete(key);
      }
    }
  }
};

/**
 * Debounce hook for reducing excessive API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle function calls
 */
export function useThrottle<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  
  return useCallback(
    ((...args: FunctionParameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Progressive loading hook - loads data in batches
 */
export function useProgressiveLoad<T>(
  loadFunction: () => Promise<T[]>,
  batchSize = 5,
  deps: DependencyList = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadBatch = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const allItems = await loadFunction();
      const nextBatch = allItems.slice(items.length, items.length + batchSize);
      
      setItems(prev => [...prev, ...nextBatch]);
      setHasMore(items.length + nextBatch.length < allItems.length);
    } catch (error) {
      console.error('Progressive load error:', error);
    } finally {
      setLoading(false);
    }
  }, [loadFunction, batchSize, items.length, loading, hasMore]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    loadBatch();
  }, deps);

  return { items, loading, hasMore, loadMore: loadBatch };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, options]);

  return [setNode, inView] as const;
}

/**
 * Batch async operations to reduce RPC calls
 */
export async function batchAsyncOperations<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize = 3,
  delayMs = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => operation(item))
    );
    results.push(...batchResults);
    
    // Add small delay between batches to prevent rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Optimized blockchain data fetcher with caching
 */
export function useOptimizedBlockchainData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  dependencies: DependencyList = [],
  ttlSeconds = 60
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const cacheKey = `${key}_${JSON.stringify(dependencies)}`;
    
    // Check cache first
    const cachedData = cacheUtils.get(cacheKey) as T | null;
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      cacheUtils.set(cacheKey, result, ttlSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error fetching ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, ttlSeconds, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Component-level performance monitor
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    console.log(`🚀 ${componentName} mounting...`);

    return () => {
      const endTime = performance.now();
      console.log(`⚡ ${componentName} took ${(endTime - startTime).toFixed(2)}ms`);
    };
  }, [componentName]);
}

/**
 * Reduce animation overhead for performance
 */
export const animationConfig = {
  // Reduced animation settings for better performance
  reduced: {
    transition: 'none',
    animation: 'none'
  },
  
  // Optimized animations
  optimized: {
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    willChange: 'transform, opacity'
  }
};

/**
 * Memory cleanup utility
 */
export function useCleanup(cleanupFunction: () => void) {
  useEffect(() => {
    return cleanupFunction;
  }, [cleanupFunction]);
}