import React from 'react'; // <-- Perbaikan: Tambahkan baris ini

/**
 * Utility functions untuk monitoring dan optimasi performance
 */

/**
 * Debounce function untuk mengurangi frekuensi pemanggilan function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function untuk membatasi frekuensi pemanggilan function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization function untuk cache hasil function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T
): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Performance timer untuk mengukur waktu eksekusi
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private label: string;

  constructor(label: string = 'Timer') {
    this.label = label;
  }

  start(): void {
    this.startTime = performance.now();
    console.time(this.label);
  }

  end(): number {
    this.endTime = performance.now();
    console.timeEnd(this.label);
    return this.getDuration();
  }

  getDuration(): number {
    return this.endTime - this.startTime;
  }

  static measure<T>(label: string, fn: () => T): T {
    const timer = new PerformanceTimer(label);
    timer.start();
    const result = fn();
    timer.end();
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerformanceTimer(label);
    timer.start();
    const result = await fn();
    timer.end();
    return result;
  }
}

/**
 * Lazy loading utility untuk dynamic imports
 */
export const lazyLoad = <T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

/**
 * Image lazy loading dengan intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  observe(img: HTMLImageElement): void {
    this.images.add(img);
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement): void {
    this.images.delete(img);
    this.observer.unobserve(img);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          this.unobserve(img);
        }
      }
    });
  }

  disconnect(): void {
    this.observer.disconnect();
    this.images.clear();
  }
}

/**
 * Bundle size analyzer untuk development
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.group('Bundle Analysis');
    console.log(`Scripts loaded: ${scripts.length}`);
    console.log(`Stylesheets loaded: ${styles.length}`);
    
    scripts.forEach((script, index) => {
      const src = (script as HTMLScriptElement).src;
      console.log(`Script ${index + 1}: ${src}`);
    });
    
    styles.forEach((style, index) => {
      const href = (style as HTMLLinkElement).href;
      console.log(`Stylesheet ${index + 1}: ${href}`);
    });
    
    console.groupEnd();
  }
};

/**
 * Memory usage monitor
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    console.group('Memory Usage');
    console.log(`Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
    console.groupEnd();
  }
};

/**
 * FPS monitor untuk performance tracking
 */
export class FPSMonitor {
  private fps: number = 0;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private isRunning: boolean = false;
  private callback?: (fps: number) => void;

  constructor(callback?: (fps: number) => void) {
    this.callback = callback;
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
  }

  private tick(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.callback) {
        this.callback(this.fps);
      }
    }

    requestAnimationFrame(() => this.tick());
  }

  getFPS(): number {
    return this.fps;
  }
}