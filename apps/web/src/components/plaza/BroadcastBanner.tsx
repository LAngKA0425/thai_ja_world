'use client'

import { useEffect, useState } from 'react'
import styles from './BroadcastBanner.module.css'

interface BroadcastBannerProps {
  broadcast: {
    id: string
    senderNickname: string
    message: string
    type: 'NORMAL' | 'PREMIUM'
    expiresAt?: string
  } | null
}

export function BroadcastBanner({ broadcast }: BroadcastBannerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!broadcast?.expiresAt) return

    const updateTimer = () => {
      const expiresTime = new Date(broadcast.expiresAt!).getTime()
      const now = Date.now()
      const remaining = Math.max(0, expiresTime - now)

      if (remaining === 0) {
        setTimeLeft(null)
      } else {
        setTimeLeft(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [broadcast?.expiresAt])

  if (!broadcast || timeLeft === 0) {
    return null
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
  }

  const isPremium = broadcast.type === 'PREMIUM'

  return (
    <div
      className={`${styles.banner} ${isPremium ? styles.premium : styles.normal}`}
    >
      <div className={styles.content}>
        <span className={styles.icon}>{isPremium ? '⭐' : '📢'}</span>
        <div className={styles.text}>
          <div className={styles.sender}>{broadcast.senderNickname}님의 공지</div>
          <div className={styles.message}>{broadcast.message}</div>
        </div>
        {timeLeft && (
          <span className={styles.timer}>{formatTime(timeLeft)}</span>
        )}
      </div>
    </div>
  )
}
