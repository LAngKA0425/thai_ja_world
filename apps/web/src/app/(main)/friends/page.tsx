'use client'

import { useState } from 'react'
import { useFriendship } from '@/hooks/useFriendship'
import { FriendCard } from '@/components/friendship/FriendCard'
import { FriendRequestCard } from '@/components/friendship/FriendRequestCard'
import { t } from '@/lib/i18n'

export default function FriendsPage() {
  const {
    friends,
    receivedRequests,
    sentRequests,
    loading,
    removeFriend,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  } = useFriendship()
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>(
    'friends'
  )
  const [searchQuery, setSearchQuery] = useState('')

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">{t('friendship.friends')}</h2>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const filteredFriends = friends.filter((f) =>
    f.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('friendship.friends')}</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder={t('friendship.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="cute-input w-full mb-6"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'friends'
              ? 'cute-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('friendship.myFriends')} ({filteredFriends.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'received'
              ? 'cute-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('friendship.receivedRequests')} ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'sent'
              ? 'cute-button'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('friendship.sentRequests')} ({sentRequests.length})
        </button>
      </div>

      {/* Friends list */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onDelete={removeFriend}
              />
            ))
          ) : (
            <div className="cute-card text-center py-8 text-gray-500">
              {searchQuery ? t('friendship.noSearchResults') : t('friendship.noFriends')}
            </div>
          )}
        </div>
      )}

      {/* Received requests */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                type="received"
                onAccept={acceptRequest}
                onReject={rejectRequest}
              />
            ))
          ) : (
            <div className="cute-card text-center py-8 text-gray-500">
              {t('friendship.noReceivedRequests')}
            </div>
          )}
        </div>
      )}

      {/* Sent requests */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                type="sent"
                onCancel={cancelRequest}
              />
            ))
          ) : (
            <div className="cute-card text-center py-8 text-gray-500">
              {t('friendship.noSentRequests')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
