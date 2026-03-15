import { NextRequest, NextResponse } from 'next/server'
import {
  findUserById,
  findShopItem,
  addInventoryItem,
  updateUser,
  getInventory,
  isItemOwned,
  addGemTransaction,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { message: apiMessages.auth.tokenRequired },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: apiMessages.auth.invalidToken },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { shopItemId } = body

    if (!shopItemId) {
      return NextResponse.json(
        { message: apiMessages.shop.itemIdRequired },
        { status: 400 }
      )
    }

    const user = findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { message: apiMessages.errors.userNotFound },
        { status: 404 }
      )
    }

    const shopItem = findShopItem(shopItemId)
    if (!shopItem) {
      return NextResponse.json(
        { message: apiMessages.shop.itemNotFound },
        { status: 404 }
      )
    }

    // Check if item is active
    if (!shopItem.isActive) {
      return NextResponse.json(
        { message: apiMessages.shop.itemNotForSale },
        { status: 400 }
      )
    }

    // Check if already owned (for non-stackable items)
    const stackableCategories = ['broadcast', 'starter']
    if (!stackableCategories.includes(shopItem.category) && isItemOwned(payload.userId, shopItemId)) {
      return NextResponse.json(
        { message: apiMessages.shop.alreadyOwned },
        { status: 400 }
      )
    }

    // Check if user has enough currency
    const hasSufficientCurrency =
      shopItem.currency === 'gems'
        ? user.gems >= shopItem.price
        : user.points >= shopItem.price

    if (!hasSufficientCurrency) {
      return NextResponse.json(
        {
          message: shopItem.currency === 'gems'
            ? apiMessages.shop.insufficientStylePoints
            : apiMessages.shop.insufficientBalance,
        },
        { status: 400 }
      )
    }

    // Deduct currency
    const newUser = updateUser(payload.userId, {
      gems:
        shopItem.currency === 'gems'
          ? user.gems - shopItem.price
          : user.gems,
      points:
        shopItem.currency === 'points'
          ? user.points - shopItem.price
          : user.points,
    })

    if (!newUser) {
      return NextResponse.json(
        { message: apiMessages.shop.purchaseFailed },
        { status: 500 }
      )
    }

    // Record gem transaction
    addGemTransaction(
      payload.userId,
      -shopItem.price,
      'purchase',
      `${shopItem.name} ${apiMessages.shop.purchaseDescription}`,
      shopItemId
    )

    // Add to inventory
    addInventoryItem(payload.userId, shopItemId, 1, shopItem.expirationDays)

    const inventory = getInventory(payload.userId)
    const inventoryWithDetails = inventory.map((item) => {
      const si = findShopItem(item.shopItemId)
      return {
        id: item.id,
        shopItemId: item.shopItemId,
        name: si?.name || apiMessages.shop.unknownItem,
        category: si?.category || 'other',
        quantity: item.quantity,
        acquiredAt: item.acquiredAt,
        expiresAt: item.expiresAt,
        isEquipped: item.isEquipped,
      }
    })

    return NextResponse.json({
      success: true,
      gems: newUser.gems,
      points: newUser.points,
      inventory: inventoryWithDetails,
    })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
