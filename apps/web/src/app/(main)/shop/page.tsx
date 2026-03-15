'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useShop } from '@/hooks/useShop'
import { ShopItemCard } from '@/components/shop/ShopItemCard'
import { useInventoryStore } from '@/stores/inventory-store'
import { t } from '@/lib/i18n'

export default function ShopPage() {
  const { user, token } = useAuthStore()
  const { items, loading, error, purchase, isOwned } = useShop()
  const { gems, points, fetchInventory } = useInventoryStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  useEffect(() => {
    if (token && user) {
      fetchInventory(user.id, token)
    }
  }, [token, user, fetchInventory])

  const categories = [
    { id: 'all', label: t('shop.category.all') },
    { id: 'top', label: t('shop.category.top') },
    { id: 'bottom', label: t('shop.category.bottom') },
    { id: 'shoes', label: t('shop.category.shoes') },
    { id: 'accessory', label: t('shop.category.accessory') },
    { id: 'skin', label: t('shop.category.skin') },
    { id: 'bgm', label: t('shop.category.bgm') },
    { id: 'effect', label: t('shop.category.effect') },
    { id: 'broadcast', label: t('shop.category.broadcast') },
  ]

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory)

  const handlePurchase = async (itemId: string) => {
    try {
      setPurchaseError(null)
      await purchase(itemId)
      setPurchaseSuccess(true)
      setTimeout(() => setPurchaseSuccess(false), 2000)
      if (token && user) {
        fetchInventory(user.id, token)
      }
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : t('shop.purchaseFailed'))
      setTimeout(() => setPurchaseError(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">{t('shop.title')}</h2>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">{t('shop.title')}</h2>
      </div>

      {/* Currency display */}
      <div className="cute-card mb-6 flex gap-4 justify-center p-4">
        <div className="text-center">
          <div className="text-2xl mb-1">💎</div>
          <p className="text-lg font-bold text-gray-800">{gems}</p>
          <p className="text-xs text-gray-500">{t('shop.stylePoints')}</p>
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="text-center">
          <div className="text-2xl mb-1">⭐</div>
          <p className="text-lg font-bold text-gray-800">{points}</p>
          <p className="text-xs text-gray-500">{t('shop.activityScore')}</p>
        </div>
      </div>

      {/* Success/Error messages */}
      {purchaseSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-2xl font-bold text-center animate-bounce-cute">
          🎉 {t('shop.purchaseCompleted')}
        </div>
      )}

      {purchaseError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl font-bold text-center">
          ❌ {purchaseError}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-2xl text-center">
          {error}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === cat.id
                ? 'cute-button'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              isOwned={isOwned(item.id)}
              currentGems={gems}
              currentPoints={points}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      ) : (
        <div className="cute-card text-center py-8">
          <p className="text-gray-600">{t('common.noData')}</p>
        </div>
      )}
    </div>
  )
}
