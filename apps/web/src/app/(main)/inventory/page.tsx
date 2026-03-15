'use client'

import { useEffect, useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard'
import { t } from '@/lib/i18n'

export default function InventoryPage() {
  const { items, gems, points, loading, error, refresh, equipItem, unequipItem } =
    useInventory()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [equippedItems, setEquippedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    refresh()
  }, [refresh])

  const categories = [
    { id: 'all', label: t('common.all') },
    { id: 'top', label: t('inventory.top') },
    { id: 'bottom', label: t('inventory.bottom') },
    { id: 'shoes', label: t('inventory.shoes') },
    { id: 'accessory', label: t('inventory.accessory') },
    { id: 'skin', label: t('minihome.skin') },
    { id: 'bgm', label: 'BGM' },
    { id: 'effect', label: t('inventory.effect') },
    { id: 'broadcast', label: t('inventory.broadcast') },
  ]

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory)

  const handleEquip = async (itemId: string) => {
    try {
      await equipItem(itemId)
      setEquippedItems((prev) => new Set(prev).add(itemId))
    } catch (err) {
      console.error('Failed to equip item:', err)
    }
  }

  const handleUnequip = async (itemId: string) => {
    try {
      await unequipItem(itemId)
      setEquippedItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    } catch (err) {
      console.error('Failed to unequip item:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">{t('inventory.title')}</h2>
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <h2 className="text-2xl font-bold mb-6">{t('inventory.title')}</h2>

      {/* Currency display */}
      <div className="cute-card mb-6 flex gap-4 justify-center p-4">
        <div className="text-center">
          <div className="text-2xl mb-1">💎</div>
          <p className="text-lg font-bold text-gray-800">{gems}</p>
          <p className="text-xs text-gray-500">{t('shop.stylePoints')}</p>
        </div>
        <div className="w-px bg-pink-200"></div>
        <div className="text-center">
          <div className="text-2xl mb-1">⭐</div>
          <p className="text-lg font-bold text-gray-800">{points}</p>
          <p className="text-xs text-gray-500">{t('shop.activityScore')}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl text-center">
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
            <InventoryItemCard
              key={item.id}
              item={item}
              isEquipped={equippedItems.has(item.id)}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          ))}
        </div>
      ) : (
        <div className="cute-card text-center py-8">
          <p className="text-gray-600">
            {selectedCategory === 'all'
              ? t('inventory.noItems')
              : t('inventory.noCategoryItems')}
          </p>
          <p className="text-sm text-gray-500 mt-2">{t('inventory.goToShop')}</p>
        </div>
      )}
    </div>
  )
}
