import { create } from 'zustand'

export interface InventoryItem {
  id: string
  shopItemId: string
  name: string
  category: string
  quantity: number
  acquiredAt: string
  expiresAt?: string
  isEquipped?: boolean
}

interface InventoryState {
  items: InventoryItem[]
  gems: number
  points: number
  fetchInventory: (userId: string, token: string) => Promise<void>
  addItem: (item: InventoryItem) => void
  removeItem: (itemId: string, quantity?: number) => void
  updateCurrency: (gems: number, points: number) => void
  purchaseItem: (shopItemId: string, token: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  gems: 0,
  points: 0,

  fetchInventory: async (userId: string, token: string) => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        set({
          items: data.items,
          gems: data.gems,
          points: data.points,
        })
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    }
  },

  addItem: (item: InventoryItem) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (itemId: string, quantity: number = 1) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  updateCurrency: (gems: number, points: number) =>
    set({ gems, points }),

  purchaseItem: async (shopItemId: string, token: string) => {
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shopItemId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Purchase failed')
      }

      const data = await response.json()
      set({
        items: data.inventory,
        gems: data.gems,
        points: data.points,
      })
    } catch (error) {
      console.error('Purchase error:', error)
      throw error
    }
  },
}))
