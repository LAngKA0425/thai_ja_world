import { NextRequest, NextResponse } from 'next/server'
import {
  findUserById,
  getInventory,
  findShopItem,
  equipItem,
  unequipItem,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'

export async function GET(request: NextRequest) {
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

    const user = findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { message: apiMessages.errors.userNotFound },
        { status: 404 }
      )
    }

    const inventory = getInventory(payload.userId)
    const itemsWithDetails = inventory.map((invItem) => {
      const shopItem = findShopItem(invItem.shopItemId)
      return {
        id: invItem.id,
        shopItemId: invItem.shopItemId,
        name: shopItem?.name || apiMessages.shop.unknownItem,
        category: shopItem?.category || 'other',
        quantity: invItem.quantity,
        acquiredAt: invItem.acquiredAt,
        expiresAt: invItem.expiresAt,
        isEquipped: invItem.isEquipped,
      }
    })

    return NextResponse.json({
      items: itemsWithDetails,
      gems: user.gems,
      points: user.points,
    })
  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { action, itemId } = body

    if (!action || !itemId) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    if (action === 'equip') {
      const result = equipItem(payload.userId, itemId)
      if (!result) {
        return NextResponse.json(
          { message: apiMessages.inventory.equipFailed },
          { status: 400 }
        )
      }
    } else if (action === 'unequip') {
      const result = unequipItem(payload.userId, itemId)
      if (!result) {
        return NextResponse.json(
          { message: apiMessages.inventory.unequipFailed },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    // Return updated inventory
    const user = findUserById(payload.userId)
    const inventory = getInventory(payload.userId)
    const itemsWithDetails = inventory.map((invItem) => {
      const shopItem = findShopItem(invItem.shopItemId)
      return {
        id: invItem.id,
        shopItemId: invItem.shopItemId,
        name: shopItem?.name || apiMessages.shop.unknownItem,
        category: shopItem?.category || 'other',
        quantity: invItem.quantity,
        acquiredAt: invItem.acquiredAt,
        expiresAt: invItem.expiresAt,
        isEquipped: invItem.isEquipped,
      }
    })

    return NextResponse.json({
      items: itemsWithDetails,
      gems: user?.gems || 0,
      points: user?.points || 0,
    })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
