// Simplified performance monitoring
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Log critical performance issues
    if (name === 'LCP' && value > 2500) {
      console.warn(`Poor LCP detected: ${value}ms`)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  async sendMetricsToAnalytics() {
    // Send metrics to your analytics service
    try {
      const metricsToSend = this.metrics.filter(m => 
        Date.now() - m.timestamp < 5 * 60 * 1000 // Last 5 minutes
      )

      if (metricsToSend.length === 0) return

      console.log('Performance metrics:', metricsToSend)
    } catch (error) {
      console.error('Error sending metrics:', error)
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private static cache = new Map<string, string>()

  static async optimizeImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const width = img.width * ratio
        const height = img.height * ratio

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', quality)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  static generateThumbnail(file: File, size = 150): Promise<Blob> {
    return this.optimizeImage(file, size, 0.6)
  }

  static getCachedImage(url: string): string | null {
    return this.cache.get(url) || null
  }

  static setCachedImage(url: string, dataUrl: string): void {
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    this.cache.set(url, dataUrl)
  }
}

// Database query optimization
export class QueryOptimizer {
  private static queryCache = new Map<string, { data: any, timestamp: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getCachedQuery(key: string): any | null {
    const cached = this.queryCache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.queryCache.delete(key)
      return null
    }

    return cached.data
  }

  static setCachedQuery(key: string, data: any): void {
    if (this.queryCache.size > 20) {
      const firstKey = this.queryCache.keys().next().value
      if (firstKey) this.queryCache.delete(firstKey)
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  static generateQueryKey(table: string, filters: Record<string, any>): string {
    return `${table}_${JSON.stringify(filters)}`
  }

  static async optimizedQuery(
    queryFn: () => Promise<any>,
    cacheKey?: string
  ): Promise<any> {
    if (cacheKey) {
      const cached = this.getCachedQuery(cacheKey)
      if (cached) return cached
    }

    const result = await queryFn()

    if (cacheKey && result) {
      this.setCachedQuery(cacheKey, result)
    }

    return result
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Auto-send metrics every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.sendMetricsToAnalytics()
  }, 5 * 60 * 1000)

  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.sendMetricsToAnalytics()
  })
}

export default performanceMonitor