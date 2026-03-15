import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

export interface BroadcastItem {
  id: string
  name: string
  category: string
  quantity: number
}

export interface BroadcastHistory {
  id: string
  message: string
  type: 'NORMAL' | 'PREMIUM'
  createdAt: string
  itemId?: string
}

const BROADCAST_COOLDOWN = 60 // seconds

interface UseBroadcastResult {
  broadcastItems: BroadcastItem[]
  history: BroadcastHistory[]
  lastBroadcastTime: number | null
  cooldownRemaining: number
  loading: boolean
  error: string | null
  send: (message: string, type: 'NORMAL' | 'PREMIUM', itemId?: string) => Promise<void>
  refreshHistory: () => Promise<void>
}

export function useBroadcast(): UseBroadcastResult {
  const { token } = useAuthStore()
  const { items: inventoryItems } = useInventoryStore()
  const [broadcastItems, setBroadcastItems] = useState<BroadcastItem[]>([])
  const [history, setHistory] = useState<BroadcastHistory[]>([])
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate broadcast items from inventory
  useEffect(() => {
    const broadcastInvItems = inventoryItems
      .filter((item) => item.category === 'broadcast')
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
      }))
    setBroadcastItems(broadcastInvItems)
  }, [inventoryItems])

  // Update cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastBroadcastTime) {
        const elapsed = Math.floor((Date.now() - lastBroadcastTime) / 1000)
        const remaining = Math.max(0, BROADCAST_COOLDOWN - elapsed)
        setCooldownRemaining(remaining)

        if (remaining === 0) {
          setLastBroadcastTime(null)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastBroadcastTime])

  const send = useCallback(
    async (message: string, type: 'NORMAL' | 'PREMIUM', itemId?: string) => {
      if (!token) throw new Error('Not authenticated')
      if (lastBroadcastTime && cooldownRemaining > 0) {
        throw new Error(`${cooldownRemaining}초 후에 다시 시도해주세요`)
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            type,
            itemId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Broadcast failed')
        }

        setLastBroadcastTime(Date.now())
        setCooldownRemaining(BROADCAST_COOLDOWN)
        await refreshHistory()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [token, lastBroadcastTime, cooldownRemaining]
  )

  const refreshHistory = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch('/api/broadcast?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (err) {
      console.error('Failed to fetch broadcast history:', err)
    }
  }, [token])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  return {
    broadcastItems,
    history,
    lastBroadcastTime,
    cooldownRemaining,
    loading,
    error,
    send,
    refreshHistory,
  }
}
