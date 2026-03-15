'use client'

import { ShopItem } from './ShopItemCard'
import { t } from '@/lib/i18n'

interface PurchaseModalProps {
  item: ShopItem
  currentGems: number
  currentPoints: number
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function PurchaseModal({
  item,
  currentGems,
  currentPoints,
  onConfirm,
  onCancel,
  isLoading,
}: PurchaseModalProps) {
  const currentBalance =
    item.currency === 'gems' ? currentGems : currentPoints
  const hasEnough = currentBalance >= item.price
  const remainingAfter = currentBalance - item.price

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="cute-card max-w-sm w-full p-6 animate-bounce-cute">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('shop.confirmPurchase')}</h2>

        {/* Item preview */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 mb-6 text-center">
          <div className="text-5xl mb-3">
            {{ top: '👕', bottom: '👖', shoes: '👟', accessory: '🎀', skin: '🎨', bgm: '🎵', effect: '✨', costume: '👔', background: '🖼️', furniture: '🪑', broadcast: '📢', starter: '🎁' }[item.category] || '🎁'}
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>

        {/* Price and balance info */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{t('shop.price')}:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {item.currency === 'gems' ? '💎' : '⭐'}
              </span>
              <span className="font-bold">{item.price}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">{item.currency === 'gems' ? t('shop.stylePoints') : t('shop.activityScore')}:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {item.currency === 'gems' ? '💎' : '⭐'}
              </span>
              <span className="font-bold">{currentBalance}</span>
            </div>
          </div>

          {hasEnough && (
            <div className="flex justify-between items-center border-t-2 border-gray-200 pt-3">
              <span className="text-gray-700 font-bold">{t('shop.confirmPurchase')}:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {item.currency === 'gems' ? '💎' : '⭐'}
                </span>
                <span className="font-bold text-green-600">{remainingAfter}</span>
              </div>
            </div>
          )}

          {!hasEnough && (
            <div className="text-center text-red-500 font-bold border-t-2 border-red-200 pt-3">
              {t('shop.insufficientBalance')}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !hasEnough}
            className="flex-1 py-3 rounded-2xl font-bold cute-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('common.loading') : t('shop.purchase')}
          </button>
        </div>
      </div>
    </div>
  )
}
