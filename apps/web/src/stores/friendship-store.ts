import { create } from 'zustand'

export interface Friend {
  id: string
  userId: string
  nickname: string
  avatar?: string
  character?: string
  lastVisited?: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromNickname: string
  fromAvatar?: string
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected'
}

interface FriendshipState {
  friends: Friend[]
  sentRequests: FriendRequest[]
  receivedRequests: FriendRequest[]
  fetchFriends: (token: string) => Promise<void>
  fetchPendingRequests: (token: string) => Promise<void>
  addFriend: (userId: string, token: string) => Promise<void>
  removeFriend: (friendId: string, token: string) => Promise<void>
  acceptFriendRequest: (requestId: string, token: string) => Promise<void>
  rejectFriendRequest: (requestId: string, token: string) => Promise<void>
}

export const useFriendshipStore = create<FriendshipState>((set) => ({
  friends: [],
  sentRequests: [],
  receivedRequests: [],

  fetchFriends: async (token: string) => {
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        set({
          friends: data.friends,
        })
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    }
  },

  fetchPendingRequests: async (token: string) => {
    try {
      const response = await fetch('/api/friends?pending=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        set({
          receivedRequests: data.received || [],
          sentRequests: data.sent || [],
        })
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    }
  },

  addFriend: async (userId: string, token: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Add friend error:', error)
      throw error
    }
  },

  removeFriend: async (friendId: string, token: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove friend')
      }

      set((state) => ({
        friends: state.friends.filter((f) => f.id !== friendId),
      }))
    } catch (error) {
      console.error('Remove friend error:', error)
      throw error
    }
  },

  acceptFriendRequest: async (requestId: string, token: string) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to accept friend request')
      }

      const data = await response.json()
      set((state) => ({
        friends: [...state.friends, data.newFriend],
        receivedRequests: state.receivedRequests.filter((r) => r.id !== requestId),
      }))
    } catch (error) {
      console.error('Accept friend request error:', error)
      throw error
    }
  },

  rejectFriendRequest: async (requestId: string, token: string) => {
    try {
      const response = await fetch(`/api/friends/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reject friend request')
      }

      set((state) => ({
        receivedRequests: state.receivedRequests.filter((r) => r.id !== requestId),
      }))
    } catch (error) {
      console.error('Reject friend request error:', error)
      throw error
    }
  },
}))
