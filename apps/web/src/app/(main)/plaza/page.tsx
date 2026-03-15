'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { PlazaCanvas } from '@/components/plaza/PlazaCanvas'
import { PlazaChat } from '@/components/plaza/PlazaChat'
import { PlazaChatInput } from '@/components/plaza/PlazaChatInput'
import { BroadcastBanner } from '@/components/plaza/BroadcastBanner'
import { UserProfileCard } from '@/components/plaza/UserProfileCard'
import { usePlaza } from '@/hooks/usePlaza'
import { t } from '@/lib/i18n'
import styles from './plaza.module.css'

export default function PlazaPage() {
  const { user } = useAuthStore()
  const plaza = usePlaza()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  // Combine chat and system messages for display
  const allMessages = [
    ...plaza.systemMessages.map((msg) => ({
      ...msg,
      type: msg.type,
    })),
    ...plaza.chatMessages.map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      nickname: msg.nickname,
      message: msg.message,
      timestamp: msg.timestamp,
      isOwn: msg.userId === user?.id,
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (!user) {
    return <div>{t('common.loading')}</div>
  }

  const currentUser = {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    character: user.character,
    isOnline: plaza.isConnected,
    position: plaza.myPosition || { x: 50, y: 50 },
  }

  return (
    <div className={styles.container}>
      {/* Broadcast Banner */}
      <div className={styles.bannerContainer}>
        <BroadcastBanner broadcast={plaza.activeBroadcast} />
      </div>

      {/* Top Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🏛️ {t('plaza.title')}</h1>
        <div className={styles.stats}>
          <span className={styles.onlineCount}>
            <span className={styles.dot} />
            {plaza.onlineCount}{t('plaza.onlineCount')}
          </span>
          {plaza.isConnected ? (
            <span className={styles.status + ' ' + styles.connected}>
              ● {t('plaza.connected')}
            </span>
          ) : (
            <span className={styles.status}>{t('plaza.connecting')}</span>
          )}
        </div>
      </div>

      {/* Main Plaza Area */}
      <div className={styles.plazaSection}>
        <PlazaCanvas
          currentUser={currentUser}
          otherUsers={plaza.users.filter((u) => u.id !== user.id)}
          onUserClick={setSelectedUser}
          onCanvasClick={(x, y) => plaza.moveCharacter(x, y)}
          myPosition={plaza.myPosition ?? { x: 50, y: 50 }}
        />
      </div>

      {/* Chat Section */}
      <div className={`${styles.chatSection} ${isChatCollapsed ? styles.collapsed : ''}`}>
        <button
          className={styles.collapseButton}
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
        >
          {isChatCollapsed ? t('plaza.showChat') : t('plaza.hideChat')}
        </button>

        {!isChatCollapsed && (
          <>
            <PlazaChat messages={allMessages} isLoading={!plaza.isConnected} />
            <PlazaChatInput
              onSend={plaza.sendMessage}
              isLoading={!plaza.isConnected}
              maxLength={100}
            />
          </>
        )}
      </div>

      {/* Error Message */}
      {plaza.error && (
        <div className={styles.errorMessage}>
          <p>{t('plaza.connectionError')}: {plaza.error}</p>
        </div>
      )}

      {/* User Profile Card */}
      <UserProfileCard
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}
