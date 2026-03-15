import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'

interface UseModulationResult {
  report: (targetUserId: string, reason: string, description: string) => Promise<void>
  blockUser: (targetUserId: string) => Promise<void>
  unblockUser: (targetUserId: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function useModeration(): UseModulationResult {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const report = useCallback(
    async (targetUserId: string, reason: string, description: string) => {
      if (!token) throw new Error('Not authenticated')

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/moderation/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetUserId,
            reason,
            description,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Report failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  const blockUser = useCallback(
    async (targetUserId: string) => {
      if (!token) throw new Error('Not authenticated')

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/moderation/block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetUserId,
            action: 'block',
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Block failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  const unblockUser = useCallback(
    async (targetUserId: string) => {
      if (!token) throw new Error('Not authenticated')

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/moderation/block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetUserId,
            action: 'unblock',
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'Unblock failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  return {
    report,
    blockUser,
    unblockUser,
    loading,
    error,
  }
}
