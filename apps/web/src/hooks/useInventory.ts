import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore, InventoryItem } from '@/stores/inventory-store'

interface UseInventoryResult {
  items: InventoryItem[]
  gems: number
  points: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  equipItem: (itemId: string) => Promise<void>
  unequipItem: (itemId: string) => Promise<void>
}

export function useInventory(): UseInventoryResult {
  const { token, user } = useAuthStore()
  const { items, gems, points, fetchInventory } = useInventoryStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!token || !user) return

    try {
      setLoading(true)
      setError(null)
      await fetchInventory(user.id, token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh inventory')
    } finally {
      setLoading(false)
    }
  }, [token, user, fetchInventory])

  const equipItem = useCallback(
    async (itemId: string) => {
      if (!token || !user) throw new Error('Not authenticated')

      try {
        setError(null)
        const response = await fetch('/api/inventory', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'equip',
            itemId,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Failed to equip item')
        }

        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      }
    },
    [token, user, refresh]
  )

  const unequipItem = useCallback(
    async (itemId: string) => {
      if (!token || !user) throw new Error('Not authenticated')

      try {
        setError(null)
        const response = await fetch('/api/inventory', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'unequip',
            itemId,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Failed to unequip item')
        }

        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      }
    },
    [token, user, refresh]
  )

  return {
    items,
    gems,
    points,
    loading,
    error,
    refresh,
    equipItem,
    unequipItem,
  }
}
