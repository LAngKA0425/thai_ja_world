import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

export interface ShopItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: 'gems' | 'points'
  isLimited: boolean
  imagePath?: string
}

interface UseShopResult {
  items: ShopItem[]
  loading: boolean
  error: string | null
  purchase: (shopItemId: string) => Promise<void>
  isOwned: (shopItemId: string) => boolean
}

export function useShop(): UseShopResult {
  const { token, user } = useAuthStore()
  const { items: inventoryItems, purchaseItem, updateCurrency, gems, points } = useInventoryStore()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      if (!token) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/shop/items', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch shop items')
        }

        const data = await response.json()
        setItems(data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching shop items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [token])

  const purchase = async (shopItemId: string) => {
    if (!token || !user) {
      throw new Error('Not authenticated')
    }

    try {
      await purchaseItem(shopItemId, token)
    } catch (err) {
      throw err
    }
  }

  const isOwned = (shopItemId: string): boolean => {
    return inventoryItems.some((item) => item.shopItemId === shopItemId)
  }

  return {
    items,
    loading,
    error,
    purchase,
    isOwned,
  }
}
