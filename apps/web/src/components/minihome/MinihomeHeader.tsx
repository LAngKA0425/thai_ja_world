'use client'

import { useRouter } from 'next/navigation'
import styles from './MinihomeHeader.module.css'

interface MinihomeHeaderProps {
  nickname: string
  avatar?: string
  character?: string
  visitorCount: number
  isOnline: boolean
  isOwn: boolean
}

export function MinihomeHeader({
  nickname,
  avatar,
  character,
  visitorCount,
  isOnline,
  isOwn,
}: MinihomeHeaderProps) {
  const router = useRouter()

  const getAvatarEmoji = (character?: string, avatar?: string) => {
    if (character) return character
    if (avatar) return avatar
    return '🧑'
  }

  return (
    <div className={styles.header}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← 돌아가기
      </button>

      <div className={styles.content}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {getAvatarEmoji(character, avatar)}
          </div>
          <div className={styles.info}>
            <h1 className={styles.nickname}>{nickname}님의 미니홈피</h1>
            <div className={styles.stats}>
              <span className={styles.stat}>
                {isOnline && <span className={styles.onlineDot} />}
                {isOnline ? '온라인' : '오프라인'}
              </span>
              <span className={styles.stat}>방문자: {visitorCount}</span>
            </div>
          </div>
        </div>

        {isOwn && (
          <button className={styles.manageButton}>
            ⚙️ 관리
          </button>
        )}
      </div>
    </div>
  )
}
