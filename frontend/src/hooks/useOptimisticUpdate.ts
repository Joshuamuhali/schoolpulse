import { useState, useCallback } from 'react'

interface OptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<any>
  onSuccess?: () => void
  onError?: (error: any) => void
  onRollback?: () => void
}

export function useOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  const [originalData, setOriginalData] = useState<T | null>(null)

  const executeOptimisticUpdate = useCallback(async (
    data: T,
    options: OptimisticUpdateOptions<T>
  ) => {
    try {
      setIsUpdating(true)
      setOriginalData(data)
      setOptimisticData(data)

      const result = await options.onUpdate(data)

      if (result?.success) {
        options.onSuccess?.()
        setOptimisticData(null)
        setOriginalData(null)
      } else {
        throw new Error(result?.error || 'Update failed')
      }
    } catch (error) {
      // Rollback on error
      setOptimisticData(null)
      setOriginalData(null)
      options.onError?.(error)
      options.onRollback?.()
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsUpdating(false)
    setOptimisticData(null)
    setOriginalData(null)
  }, [])

  return {
    isUpdating,
    optimisticData,
    originalData,
    executeOptimisticUpdate,
    reset,
  }
}

// Hook for batch optimistic updates (like attendance marking)
export function useBatchOptimisticUpdate<T>() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map())
  const [originalUpdates, setOriginalUpdates] = useState<Map<string, T>>(new Map())

  const addOptimisticUpdate = useCallback((id: string, data: T, originalData?: T) => {
    setOptimisticUpdates(prev => new Map(prev).set(id, data))
    if (originalData) {
      setOriginalUpdates(prev => new Map(prev).set(id, originalData))
    }
  }, [])

  const removeOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    setOriginalUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])

  const executeBatchUpdate = useCallback(async (
    updates: Array<{ id: string; data: T }>,
    options: OptimisticUpdateOptions<T[]>
  ) => {
    try {
      setIsUpdating(true)

      // Add all updates to optimistic state
      updates.forEach(({ id, data }) => {
        addOptimisticUpdate(id, data)
      })

      const result = await options.onUpdate(updates.map(u => u.data))

      if (result?.success) {
        options.onSuccess?.()
        // Clear optimistic updates on success
        setOptimisticUpdates(new Map())
        setOriginalUpdates(new Map())
      } else {
        throw new Error(result?.error || 'Batch update failed')
      }
    } catch (error) {
      // Rollback all optimistic updates
      setOptimisticUpdates(new Map())
      setOriginalUpdates(new Map())
      options.onError?.(error)
      options.onRollback?.()
    } finally {
      setIsUpdating(false)
    }
  }, [addOptimisticUpdate])

  const reset = useCallback(() => {
    setIsUpdating(false)
    setOptimisticUpdates(new Map())
    setOriginalUpdates(new Map())
  }, [])

  return {
    isUpdating,
    optimisticUpdates,
    originalUpdates,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    executeBatchUpdate,
    reset,
  }
}
