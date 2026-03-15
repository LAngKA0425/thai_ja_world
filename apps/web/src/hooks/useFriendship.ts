import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useFriendshipStore, Friend, FriendRequest } from '@/stores/friendship-store'

interface UseFriendshipResult {
  friends: Friend[]
  receivedRequests: FriendRequest[]
  sentRequests: FriendRequest[]
  loading: boolean
  error: string | null
  refreshFriends: () => Promise<void>
  refreshRequests: () => Promise<void>
  sendFriendRequest: (userId: string) => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  removeFriend: (friendId: string) => Promise<void>
  cancelRequest: (requestId: string) => Promise<void>
}

export function useFriendship(): UseFriendshipResult {
  const { token } = useAuthStore()
  const {
    friends,
    receivedRequests,
    sentRequests,
    fetchFriends,
    fetchPendingRequests,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendshipStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        setLoading(true)
        setError(null)
        await fetchFriends(token)
        await fetchPendingRequests(token)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, fetchFriends, fetchPendingRequests])

  const refreshFriends = async () => {
    if (!token) return
    try {
      await fetchFriends(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh friends')
    }
  }

  const refreshRequests = async () => {
    if (!token) return
    try {
      await fetchPendingRequests(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh requests')
    }
  }

  const sendFriendRequest = async (userId: string) => {
    if (!token) throw new Error('Not authenticated')
    try {
      await addFriend(userId, token)
      await refreshRequests()
    } catch (err) {
      throw err
    }
  }

  const acceptRequest = async (requestId: string) => {
    if (!token) throw new Error('Not authenticated')
    try {
      await acceptFriendRequest(requestId, token)
      await refreshFriends()
    } catch (err) {
      throw err
    }
  }

  const rejectRequest = async (requestId: string) => {
    if (!token) throw new Error('Not authenticated')
    try {
      await rejectFriendRequest(requestId, token)
    } catch (err) {
      throw err
    }
  }

  const removeFriendRequest = async (friendId: string) => {
    if (!token) throw new Error('Not authenticated')
    try {
      await removeFriend(friendId, token)
    } catch (err) {
      throw err
    }
  }

  const cancelRequest = async (requestId: string) => {
    if (!token) throw new Error('Not authenticated')
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel request')
      }

      await refreshRequests()
    } catch (err) {
      throw err
    }
  }

  return {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    error,
    refreshFriends,
    refreshRequests,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend: removeFriendRequest,
    cancelRequest,
  }
}
