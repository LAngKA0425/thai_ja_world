'use client'

import { useState } from 'react'
import { PurchaseModal } from './PurchaseModal'
import { t } from '@/lib/i18n'

export interface ShopItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: 'gems' | 'points'
  isLimited: boolean
}

interface ShopItemCardProps {
  item: ShopItem
  isOwned?: boolean
  currentGems?: number
  currentPoints?: number
  onPurchase?: (itemId: string) => Promise<void>
}

export function ShopItemCard({
  item,
  isOwned = false,
  currentGems = 0,
  currentPoints = 0,
  onPurchase,
}: ShopItemCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hasEnoughCurrency =
    item.currency === 'gems' ? currentGems >= item.price : currentPoints >= item.price

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      top: '👕',
      bottom: '👖',
      shoes: '👟',
      accessory: '🎀',
      skin: '🎨',
      bgm: '🎵',
      effect: '✨',
      costume: '👔',
      background: '🖼️',
      furniture: '🪑',
      broadcast: '📢',
      starter: '🎁',
    }
    return icons[category] || '🎁'
  }

  const handlePurchaseConfirm = async () => {
    if (!onPurchase) return
    try {
      setIsLoading(true)
      await onPurchase(item.id)
      setShowModal(false)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="cute-card p-4 hover:shadow-lg transition-shadow">
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">{getCategoryIcon(item.category)}</div>
        </div>
        <h3 className="font-bold text-center text-sm mb-2 truncate text-gray-800">
          {item.name}
        </h3>
        <p className="text-xs text-gray-600 text-center mb-3 line-clamp-2">
          {item.description}
        </p>

        {item.isLimited && (
          <div className="text-xs font-bold text-red-500 text-center mb-2 animate-pulse">
            ⭐ {t('shop.limited')}
          </div>
        )}

        {isOwned && (
          <div className="text-xs font-bold text-green-600 text-center mb-2">
            ✓ {t('shop.owned')}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-bold text-lg">
            {item.currency === 'gems' ? '💎' : '⭐'}
          </span>
          <span className="font-bold text-gray-700">{item.price}</span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={isOwned || !hasEnoughCurrency || isLoading}
          className={`w-full py-2 text-sm font-bold rounded-2xl transition-all ${
            isOwned
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : !hasEnoughCurrency
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'cute-button'
          }`}
        >
          {isOwned ? t('shop.owned') : !hasEnoughCurrency ? t('shop.insufficientBalance') : t('shop.purchase')}
        </button>
      </div>

      {showModal && (
        <PurchaseModal
          item={item}
          currentGems={currentGems}
          currentPoints={currentPoints}
          onConfirm={handlePurchaseConfirm}
          onCancel={() => setShowModal(false)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
