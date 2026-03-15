'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export interface Guestbook {
  id: string
  userId: string
  authorId: string
  authorNickname: string
  authorAvatar?: string
  content: string
  createdAt: string
}

export interface MinihomeData {
  id: string
  userId: string
  nickname: string
  avatar?: string
  character?: string
  visitorCount: number
  isOnline: boolean
  createdAt: string
  theme?: string
  bio?: string
  skinId?: string
  skinName?: string
  bgmId?: string
  bgmName?: string
}

export interface DecorationItem {
  id: string
  slotId: number
  itemId: string
  itemName: string
  icon?: string
}

export function useMinihome(userId?: string) {
  const { user: currentUser, token } = useAuthStore()
  const targetUserId = userId || currentUser?.id
  const isOwnMinihome = !userId || userId === currentUser?.id

  const [minihomeData, setMinihomeData] = useState<MinihomeData | null>(null)
  const [guestbookEntries, setGuestbookEntries] = useState<Guestbook[]>([])
  const [decorations, setDecorations] = useState<DecorationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch minihome data
  useEffect(() => {
    if (!targetUserId) {
      setIsLoading(false)
      return
    }

    const fetchMinihomeData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const headers: Record<string, string> = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`/api/users/${targetUserId}/minihome`, {
          headers,
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('미니홈피를 찾을 수 없습니다')
          } else {
            setError('미니홈피 로딩에 실패했습니다')
          }
          return
        }

        const data = await response.json()
        setMinihomeData({
          id: data.minihomeId || `minihome-${targetUserId}`,
          userId: data.userId,
          nickname: data.nickname,
          avatar: data.avatar,
          character: data.character,
          visitorCount: data.visitCount || 0,
          isOnline: data.isOnline || false,
          createdAt: data.createdAt || new Date().toISOString(),
          theme: data.theme,
          bio: data.bio,
          skinId: data.skinId,
          skinName: data.skinName,
          bgmId: data.bgmId,
          bgmName: data.bgmName,
        })
        setGuestbookEntries(data.guestbook || [])
        setDecorations(data.decorations || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        setError(message)
        console.error('Error fetching minihome:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMinihomeData()
  }, [targetUserId, token])

  // Add guestbook entry
  const addGuestbookEntry = useCallback(
    async (content: string) => {
      if (!targetUserId || !token) throw new Error('로그인이 필요합니다')

      try {
        const response = await fetch(`/api/users/${targetUserId}/minihome/guestbook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: content }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || '방명록 작성에 실패했습니다')
        }

        const data = await response.json()
        const entry: Guestbook = {
          id: data.id,
          userId: targetUserId,
          authorId: data.visitorId,
          authorNickname: data.visitorNickname,
          authorAvatar: data.visitorAvatar,
          content: data.message,
          createdAt: data.createdAt,
        }
        setGuestbookEntries((prev) => [entry, ...prev])
        return entry
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        throw new Error(message)
      }
    },
    [targetUserId, token]
  )

  // Delete guestbook entry
  const deleteGuestbookEntry = useCallback(
    async (entryId: string) => {
      if (!token) throw new Error('로그인이 필요합니다')

      try {
        const response = await fetch(
          `/api/users/${targetUserId}/minihome/guestbook?entryId=${entryId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('방명록 삭제에 실패했습니다')
        }

        setGuestbookEntries((prev) => prev.filter((e) => e.id !== entryId))
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        throw new Error(message)
      }
    },
    [targetUserId, token]
  )

  // Save decorations
  const saveDecorations = useCallback(
    async (newDecorations: DecorationItem[]) => {
      if (!token || !isOwnMinihome) throw new Error('권한이 없습니다')

      try {
        const response = await fetch(`/api/users/${targetUserId}/minihome`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decorations: newDecorations }),
        })

        if (!response.ok) {
          throw new Error('꾸미기 저장에 실패했습니다')
        }

        const data = await response.json()
        setDecorations(data.decorations || [])
        return data.decorations
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        throw new Error(message)
      }
    },
    [targetUserId, token, isOwnMinihome]
  )

  // Update skin
  const updateSkin = useCallback(
    async (skinId: string | null) => {
      if (!token || !isOwnMinihome) throw new Error('권한이 없습니다')

      try {
        const response = await fetch(`/api/users/${targetUserId}/minihome`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skinId }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || '스킨 변경에 실패했습니다')
        }

        const data = await response.json()
        setMinihomeData((prev) => prev ? { ...prev, skinId: data.skinId, skinName: data.skinName } : prev)
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        throw new Error(message)
      }
    },
    [targetUserId, token, isOwnMinihome]
  )

  // Update BGM
  const updateBgm = useCallback(
    async (bgmId: string | null) => {
      if (!token || !isOwnMinihome) throw new Error('권한이 없습니다')

      try {
        const response = await fetch(`/api/users/${targetUserId}/minihome`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bgmId }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || 'BGM 변경에 실패했습니다')
        }

        const data = await response.json()
        setMinihomeData((prev) => prev ? { ...prev, bgmId: data.bgmId, bgmName: data.bgmName } : prev)
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        throw new Error(message)
      }
    },
    [targetUserId, token, isOwnMinihome]
  )

  // Increment visitor count
  const incrementVisitorCount = useCallback(async () => {
    if (!targetUserId || !token || isOwnMinihome) return

    try {
      await fetch(`/api/users/${targetUserId}/minihome/visit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Failed to increment visitor count:', err)
    }
  }, [targetUserId, token, isOwnMinihome])

  return {
    minihomeData,
    guestbookEntries,
    decorations,
    isLoading,
    error,
    isOwnMinihome,
    addGuestbookEntry,
    deleteGuestbookEntry,
    saveDecorations,
    updateSkin,
    updateBgm,
    incrementVisitorCount,
  }
}
