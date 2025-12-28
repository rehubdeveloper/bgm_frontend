import { useState, useEffect, useCallback } from 'react'

interface CacheOptions {
  cacheKey: string
  cacheDuration?: number // in milliseconds, default 5 minutes
  enabled?: boolean
}

interface CachedData<T> {
  data: T | null
  timestamp: number
  isLoading: boolean
  error: string | null
  isStale: boolean
}

export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  options: CacheOptions
) {
  const { cacheKey, cacheDuration = 5 * 60 * 1000, enabled = true } = options // 5 minutes default

  const [state, setState] = useState<CachedData<T>>({
    data: null,
    timestamp: 0,
    isLoading: false,
    error: null,
    isStale: false
  })

  // Load data from cache
  const loadFromCache = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const parsed: { data: T; timestamp: number } = JSON.parse(cached)
      const now = Date.now()
      const isStale = now - parsed.timestamp > cacheDuration

      return {
        data: parsed.data,
        timestamp: parsed.timestamp,
        isStale
      }
    } catch (error) {
      console.error('Error loading from cache:', error)
      return null
    }
  }, [cacheKey, cacheDuration])

  // Save data to cache
  const saveToCache = useCallback((data: T) => {
    if (typeof window === 'undefined') return

    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }, [cacheKey])

  // Clear cache
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(cacheKey)
  }, [cacheKey])

  // Fetch fresh data
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    // Check cache first
    if (!force) {
      const cached = loadFromCache()
      if (cached && !cached.isStale) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          timestamp: cached.timestamp,
          isLoading: false,
          error: null,
          isStale: false
        }))
        return
      } else if (cached && cached.isStale) {
        // Set stale data but mark as stale
        setState(prev => ({
          ...prev,
          data: cached.data,
          timestamp: cached.timestamp,
          isStale: true
        }))
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await fetchFn()
      saveToCache(data)

      setState({
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
        isStale: false
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }, [enabled, loadFromCache, saveToCache, fetchFn])

  // Refresh data (force fetch)
  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refresh,
    clearCache
  }
}
