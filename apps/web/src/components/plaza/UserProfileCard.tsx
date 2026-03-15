'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useFriendshipStore } from '@/stores/friendship-store'
import { t } from '@/lib/i18n'
import styles from './UserProfileCard.module.css'

interface User {
  id: string
  nickname: string
  avatar?: string
  character?: string
  isOnline: boolean
}

interface UserProfileCardProps {
  user: User | null
  position?: { x: number; y: number }
  onClose: () => void
}

export function UserProfileCard({ user, position, onClose }: UserProfileCardProps) {
  const router = useRouter()
  const { user: currentUser, token } = useAuthStore()
  const { addFriend } = useFriendshipStore()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const isCurrentUser = user.id === currentUser?.id

  const handleVisitMinihome = () => {
    router.push(`/minihome/${user.id}`)
    onClose()
  }

  const handleAddFriend = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      await addFriend(user.id, token)
      alert(t('friendship.sendRequestSuccess'))
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send friend request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReport = () => {
    alert(t('moderation.reportNotReady'))
  }

  const handleBlock = () => {
    alert(t('moderation.blockNotReady'))
  }

  const getAvatarEmoji = (character?: string, avatar?: string) => {
    if (character) return character
    if (avatar) return avatar
    return '🧑'
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        style={position ? {
          position: 'absolute',
          left: `${Math.min(position.x + 10, 80)}%`,
          top: `${Math.min(position.y + 10, 60)}%`,
        } : undefined}
      >
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.avatarLarge}>{getAvatarEmoji(user.character, user.avatar)}</div>
          <div className={styles.info}>
            <h3 className={styles.nickname}>{user.nickname}</h3>
            <div className={styles.statusBadge}>
              {user.isOnline ? (
                <>
                  <span className={styles.onlineDot} /> {t('minihome.online')}
                </>
              ) : (
                t('minihome.offline')
              )}
            </div>
          </div>
        </div>

        {!isCurrentUser && (
          <div className={styles.actions}>
            <button
              className={styles.actionButton + ' ' + styles.primary}
              onClick={handleVisitMinihome}
            >
              🏠 {t('minihome.title')}
            </button>
            <button
              className={styles.actionButton + ' ' + styles.primary}
              onClick={handleAddFriend}
              disabled={isLoading}
            >
              ➕ {t('friendship.addFriend')}
            </button>
            <button
              className={styles.actionButton}
              onClick={handleReport}
            >
              🚨 {t('moderation.report')}
            </button>
            <button
              className={styles.actionButton}
              onClick={handleBlock}
            >
              🚫 {t('friendship.blockUser')}
            </button>
          </div>
        )}

        {isCurrentUser && (
          <div className={styles.actions}>
            <p className={styles.ownerLabel}>{t('plaza.myCharacter')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
