'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { usePlazaStore } from '@/stores/plaza-store'
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  onPlazaUserJoined,
  onPlazaUserLeft,
  onPlazaMessage,
  onPlazaUserMoved,
  emitPlazaMessage,
  emitPlazaMove,
  onBroadcast,
  offAll,
} from '@/lib/socket-client'

export interface Broadcast {
  id: string
  senderId: string
  senderNickname: string
  message: string
  type: 'NORMAL' | 'PREMIUM'
  createdAt: string
  expiresAt?: string
}

export function usePlaza() {
  const { user, token } = useAuthStore()
  const plazaStore = usePlazaStore()
  const [isConnected, setIsConnected] = useState(false)
  const [activeBroadcast, setActiveBroadcast] = useState<Broadcast | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) return

    try {
      const socket = initializeSocket(token)

      socket.on('connect', () => {
        setIsConnected(true)
        setError(null)
        // Join plaza room
        socket.emit('plaza:join', { userId: user.id, nickname: user.nickname })
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('error', (err) => {
        console.error('Plaza socket error:', err)
        setError(err?.message || 'Connection error')
      })

      return () => {
        offAll()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect'
      setError(message)
      console.error('Socket initialization error:', err)
    }
  }, [token, user])

  // Handle user joined
  useEffect(() => {
    const handleUserJoined = (data: any) => {
      plazaStore.addUser({
        id: data.userId,
        nickname: data.nickname,
        avatar: data.avatar,
        character: data.character,
        isOnline: true,
      })

      const message: any = {
        id: `sys-${Date.now()}`,
        message: `${data.nickname}님이 입장했습니다`,
        timestamp: new Date().toISOString(),
        type: 'join',
      }
      plazaStore.addSystemMessage(message)
    }

    onPlazaUserJoined(handleUserJoined)
  }, [plazaStore])

  // Handle user left
  useEffect(() => {
    const handleUserLeft = (data: any) => {
      plazaStore.removeUser(data.userId)

      const message: any = {
        id: `sys-${Date.now()}`,
        message: `${data.nickname}님이 퇴장했습니다`,
        timestamp: new Date().toISOString(),
        type: 'leave',
      }
      plazaStore.addSystemMessage(message)
    }

    onPlazaUserLeft(handleUserLeft)
  }, [plazaStore])

  // Handle chat messages
  useEffect(() => {
    const handleMessage = (data: any) => {
      plazaStore.addChatMessage({
        id: data.messageId || `msg-${Date.now()}`,
        userId: data.userId,
        nickname: data.nickname,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        avatar: data.avatar,
      })
    }

    onPlazaMessage(handleMessage)
  }, [plazaStore])

  // Handle user movement
  useEffect(() => {
    const handleUserMoved = (data: any) => {
      plazaStore.updateUserPosition(data.userId, {
        x: data.position.x,
        y: data.position.y,
      })
    }

    onPlazaUserMoved(handleUserMoved)
  }, [plazaStore])

  // Handle broadcasts
  useEffect(() => {
    const handleBroadcast = (data: any) => {
      setActiveBroadcast(data)

      if (data.expiresAt) {
        const expiresTime = new Date(data.expiresAt).getTime()
        const now = Date.now()
        const timeout = expiresTime - now

        if (timeout > 0) {
          setTimeout(() => {
            setActiveBroadcast(null)
          }, timeout)
        }
      }
    }

    onBroadcast(handleBroadcast)
  }, [])

  // Send message
  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || !user) return

      emitPlazaMessage(message)
      // Optimistic update
      plazaStore.addChatMessage({
        id: `msg-${Date.now()}`,
        userId: user.id,
        nickname: user.nickname,
        message,
        timestamp: new Date().toISOString(),
        avatar: user.avatar,
      })
    },
    [user, plazaStore]
  )

  // Move character
  const moveCharacter = useCallback((x: number, y: number) => {
    emitPlazaMove({ x, y })
  }, [])

  return {
    isConnected,
    activeBroadcast,
    error,
    sendMessage,
    moveCharacter,
    ...plazaStore,
  }
}
