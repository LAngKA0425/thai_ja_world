'use client'

import { useState, useCallback } from 'react'
import styles from './PlazaCanvas.module.css'

interface User {
  id: string
  nickname: string
  avatar?: string
  character?: string
  position?: { x: number; y: number }
  isOnline: boolean
}

interface PlazaCanvasProps {
  currentUser: User
  otherUsers: User[]
  onUserClick: (user: User) => void
  onCanvasClick: (x: number, y: number) => void
  myPosition?: { x: number; y: number } | null
}

export function PlazaCanvas({
  currentUser,
  otherUsers,
  onUserClick,
  onCanvasClick,
  myPosition,
}: PlazaCanvasProps) {
  const safePosition = myPosition ?? { x: 50, y: 50 }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    onCanvasClick(x, y)
  }

  const getAvatarEmoji = (character?: string, avatar?: string) => {
    if (character) return character
    if (avatar) return avatar
    return '🧑'
  }

  return (
    <div className={styles.canvas} onClick={handleCanvasClick}>
      {/* Background decorations */}
      <div className={styles.background}>
        <div className={styles.tree + ' ' + styles.tree1}>🌳</div>
        <div className={styles.tree + ' ' + styles.tree2}>🌲</div>
        <div className={styles.fountain}>⛲</div>
        <div className={styles.bench + ' ' + styles.bench1}>🪑</div>
        <div className={styles.bench + ' ' + styles.bench2}>🪑</div>
        <div className={styles.flower + ' ' + styles.flower1}>🌸</div>
        <div className={styles.flower + ' ' + styles.flower2}>🌺</div>
        <div className={styles.grass}>🍃</div>
      </div>

      {/* My character */}
      <div
        className={styles.character + ' ' + styles.myCharacter}
        style={{
          left: `${safePosition.x}%`,
          top: `${safePosition.y}%`,
        }}
        title={currentUser.nickname}
      >
        <div className={styles.avatar}>{getAvatarEmoji(currentUser.character, currentUser.avatar)}</div>
        <div className={styles.nickname}>{currentUser.nickname}</div>
        <div className={styles.status}>나</div>
      </div>

      {/* Other users */}
      {otherUsers.map((user) => (
        <div
          key={user.id}
          className={styles.character}
          style={{
            left: `${user.position?.x || Math.random() * 80 + 10}%`,
            top: `${user.position?.y || Math.random() * 70 + 10}%`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onUserClick(user)
          }}
        >
          <div className={styles.avatar}>{getAvatarEmoji(user.character, user.avatar)}</div>
          <div className={styles.nickname}>{user.nickname}</div>
          {user.isOnline && <div className={styles.onlineIndicator} />}
        </div>
      ))}
    </div>
  )
}
