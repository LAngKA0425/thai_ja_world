'use client'

import { useEffect, useRef } from 'react'
import styles from './PlazaChat.module.css'

interface Message {
  id: string
  userId?: string
  nickname?: string
  message: string
  timestamp: string
  type?: 'join' | 'leave' | 'notice'
  isOwn?: boolean
}

interface PlazaChatProps {
  messages: Message[]
  isLoading?: boolean
}

export function PlazaChat({ messages, isLoading }: PlazaChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className="loading-spinner" />
          <p>채팅 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>아직 메시지가 없습니다</p>
          <p className={styles.emptySubtext}>첫 번째 메시지를 남겨보세요!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container} ref={scrollRef}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.message} ${
            msg.type ? styles.system : msg.isOwn ? styles.own : styles.other
          }`}
        >
          {msg.type ? (
            <div className={styles.systemMessage}>
              <span className={styles.systemText}>{msg.message}</span>
            </div>
          ) : (
            <>
              <div className={styles.messageContent}>
                <div className={styles.header}>
                  <span className={styles.nickname}>{msg.nickname}</span>
                  <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                </div>
                <div className={styles.text}>{msg.message}</div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
