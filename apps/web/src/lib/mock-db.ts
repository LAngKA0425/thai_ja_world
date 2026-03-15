import crypto from 'crypto'
import bcryptjs from 'bcryptjs'

export interface MockUser {
  id: string
  email: string
  passwordHash: string
  nickname: string
  avatar?: string
  character?: string
  points: number
  gems: number
  isAdmin: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface MockShopItem {
  id: string
  name: string
  description: string
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'skin' | 'bgm' | 'effect' | 'background' | 'furniture' | 'broadcast' | 'starter' | 'costume'
  price: number
  currency: 'gems' | 'points'
  imageUrl?: string
  isLimited: boolean
  isActive: boolean
  expirationDays?: number
}

export interface MockInventoryItem {
  id: string
  userId: string
  shopItemId: string
  quantity: number
  acquiredAt: string
  expiresAt?: string
  isEquipped: boolean
}

export interface MockFriendship {
  id: string
  userId1: string
  userId2: string
  status: 'pending' | 'accepted'
  requestedBy: string
  createdAt: string
  acceptedAt?: string
}

export interface MockMinihome {
  id: string
  userId: string
  skinId?: string
  bgmId?: string
  visitCount: number
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface MockGemTransaction {
  id: string
  userId: string
  amount: number
  type: 'purchase' | 'reward' | 'refund' | 'charge'
  description: string
  shopItemId?: string
  createdAt: string
}

export interface MockGuestbookEntry {
  id: string
  minihomeUserId: string
  authorId: string
  authorNickname: string
  authorAvatar?: string
  content: string
  createdAt: string
}

interface MockDatabase {
  users: MockUser[]
  shopItems: MockShopItem[]
  inventory: MockInventoryItem[]
  friendships: MockFriendship[]
  minihomes: MockMinihome[]
  gemTransactions: MockGemTransaction[]
  guestbook: MockGuestbookEntry[]
  reports: any[]
  blocks: any[]
  broadcasts: any[]
  notices: any[]
}

// Initialize mock database
export const mockDb: MockDatabase = {
  users: [],
  shopItems: [],
  inventory: [],
  friendships: [],
  minihomes: [],
  gemTransactions: [],
  guestbook: [],
  reports: [],
  blocks: [],
  broadcasts: [],
  notices: [],
}

// Initialize with seed data
export async function initializeMockDb() {
  // Create admin user
  const adminPassword = await bcryptjs.hash('admin123', 10)
  mockDb.users.push({
    id: 'admin-001',
    email: 'admin@taeja.world',
    passwordHash: adminPassword,
    nickname: '관리자',
    points: 999999,
    gems: 999999,
    isAdmin: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Create admin minihome
  mockDb.minihomes.push({
    id: 'minihome-admin-001',
    userId: 'admin-001',
    visitCount: 0,
    bio: '태자월드 관리자입니다',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  // Create default shop items
  const shopItems: MockShopItem[] = [
    // 상의 (Tops) 12종
    { id: 'item-top-001', name: '베이직 화이트 반팔', description: '깔끔한 화이트 반팔 티셔츠', category: 'top', price: 100, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-002', name: '베이직 블랙 반팔', description: '심플한 블랙 반팔 티셔츠', category: 'top', price: 100, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-003', name: '스카이블루 긴팔', description: '시원한 스카이블루 긴팔 티셔츠', category: 'top', price: 150, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-004', name: '베이직 블랙 맨투맨', description: '편안한 블랙 맨투맨', category: 'top', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-005', name: '크림 맨투맨', description: '부드러운 크림색 맨투맨', category: 'top', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-006', name: '그레이 후드', description: '캐주얼한 그레이 후드티', category: 'top', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-007', name: '네이비 후드', description: '포근한 네이비 후드티', category: 'top', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-008', name: '화이트 셔츠', description: '깔끔한 화이트 셔츠', category: 'top', price: 250, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-009', name: '라이트블루 셔츠', description: '산뜻한 라이트블루 셔츠', category: 'top', price: 250, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-010', name: '베이지 니트', description: '따뜻한 베이지 니트', category: 'top', price: 350, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-011', name: '아이보리 니트', description: '포근한 아이보리 니트', category: 'top', price: 350, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-top-012', name: '핑크 크롭 반팔', description: '트렌디한 핑크 크롭 반팔', category: 'top', price: 180, currency: 'gems', isLimited: true, isActive: true },

    // 하의 (Bottoms) 8종
    { id: 'item-bottom-001', name: '데님 팬츠', description: '기본 데님 청바지', category: 'bottom', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-002', name: '블랙 슬랙스', description: '깔끔한 블랙 슬랙스', category: 'bottom', price: 250, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-003', name: '베이지 치노', description: '캐주얼 베이지 치노 팬츠', category: 'bottom', price: 220, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-004', name: '화이트 반바지', description: '시원한 화이트 반바지', category: 'bottom', price: 150, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-005', name: '블랙 반바지', description: '베이직 블랙 반바지', category: 'bottom', price: 150, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-006', name: '플리츠 스커트', description: '귀여운 플리츠 미니스커트', category: 'bottom', price: 280, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-007', name: '데님 스커트', description: '캐주얼 데님 미니스커트', category: 'bottom', price: 260, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bottom-008', name: '카키 카고 팬츠', description: '스타일리시한 카키 카고', category: 'bottom', price: 300, currency: 'gems', isLimited: false, isActive: true },

    // 신발 (Shoes) 4종
    { id: 'item-shoes-001', name: '화이트 스니커즈', description: '깔끔한 화이트 스니커즈', category: 'shoes', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-shoes-002', name: '블랙 스니커즈', description: '베이직 블랙 스니커즈', category: 'shoes', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-shoes-003', name: '브라운 로퍼', description: '클래식 브라운 로퍼', category: 'shoes', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-shoes-004', name: '핑크 슬리퍼', description: '귀여운 핑크 슬리퍼', category: 'shoes', price: 120, currency: 'gems', isLimited: false, isActive: true },

    // 악세서리 (Accessories) 4종
    { id: 'item-acc-001', name: '블랙 캡모자', description: '스트릿 감성 블랙 캡', category: 'accessory', price: 150, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-acc-002', name: '라운드 안경', description: '클래식 라운드 안경', category: 'accessory', price: 120, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-acc-003', name: '실버 목걸이', description: '심플 실버 체인 목걸이', category: 'accessory', price: 180, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-acc-004', name: '꽃 머리핀', description: '귀여운 꽃 머리핀', category: 'accessory', price: 100, currency: 'gems', isLimited: false, isActive: true },

    // 미니홈피 스킨 (Skins) 6종
    { id: 'item-skin-001', name: '심플 그레이 스킨', description: '깔끔한 그레이 톤 미니홈피 스킨', category: 'skin', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-skin-002', name: '파스텔 블루 스킨', description: '산뜻한 파스텔 블루 미니홈피 스킨', category: 'skin', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-skin-003', name: '파스텔 핑크 스킨', description: '사랑스러운 파스텔 핑크 미니홈피 스킨', category: 'skin', price: 300, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-skin-004', name: '다크모드 스킨', description: '세련된 다크모드 미니홈피 스킨', category: 'skin', price: 500, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-skin-005', name: '벚꽃 스킨', description: '봄 감성 벚꽃 미니홈피 스킨', category: 'skin', price: 400, currency: 'gems', isLimited: true, isActive: true },
    { id: 'item-skin-006', name: '레트로 스킨', description: '감성적인 레트로 미니홈피 스킨', category: 'skin', price: 450, currency: 'gems', isLimited: false, isActive: true },

    // BGM 5종
    { id: 'item-bgm-001', name: '잔잔한 피아노', description: '편안한 피아노 배경음악', category: 'bgm', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bgm-002', name: '경쾌한 어쿠스틱', description: '밝고 경쾌한 어쿠스틱 기타 음악', category: 'bgm', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bgm-003', name: '로파이 힙합', description: '감성적인 로파이 힙합 비트', category: 'bgm', price: 250, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bgm-004', name: '오르골 멜로디', description: '추억의 오르골 멜로디', category: 'bgm', price: 150, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-bgm-005', name: '재즈 라운지', description: '세련된 재즈 라운지 음악', category: 'bgm', price: 300, currency: 'gems', isLimited: false, isActive: true },

    // 이펙트/장식 (Effects) 3종
    { id: 'item-effect-001', name: '반짝이 이펙트', description: '미니홈피에 반짝이는 효과를 추가합니다', category: 'effect', price: 200, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-effect-002', name: '하트 이펙트', description: '미니홈피에 떠다니는 하트 효과', category: 'effect', price: 250, currency: 'gems', isLimited: false, isActive: true },
    { id: 'item-effect-003', name: '눈내리는 이펙트', description: '미니홈피에 눈이 내리는 효과', category: 'effect', price: 300, currency: 'gems', isLimited: true, isActive: true },

    // 확성기 (Broadcast)
    { id: 'item-broadcast-001', name: '일반 확성기', description: '광장에 메시지를 전송합니다', category: 'broadcast', price: 50, currency: 'points', isLimited: false, isActive: true },
    { id: 'item-broadcast-002', name: '프리미엄 확성기', description: '화려한 이펙트와 함께 광장에 메시지를 전송합니다', category: 'broadcast', price: 200, currency: 'gems', isLimited: false, isActive: true },

    // 스타터 팩
    { id: 'item-starter-001', name: '스타터 팩', description: '초보자를 위한 기본 아이템 세트', category: 'starter', price: 0, currency: 'points', isLimited: false, isActive: true },
  ]
  mockDb.shopItems = shopItems
}

// User operations
export async function createUser(
  email: string,
  password: string,
  nickname: string
): Promise<MockUser | null> {
  // Check if user exists
  if (mockDb.users.some((u) => u.email === email)) {
    return null
  }

  const id = `user-${crypto.randomBytes(8).toString('hex')}`
  const passwordHash = await bcryptjs.hash(password, 10)

  const user: MockUser = {
    id,
    email,
    passwordHash,
    nickname,
    points: 1000,
    gems: 500,
    isAdmin: false,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockDb.users.push(user)

  // Auto-create minihome for new user
  const minihome: MockMinihome = {
    id: `minihome-${id}`,
    userId: id,
    visitCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDb.minihomes.push(minihome)

  return user
}

export async function findUserByEmail(email: string): Promise<MockUser | undefined> {
  return mockDb.users.find((u) => u.email === email)
}

export function findUserById(id: string): MockUser | undefined {
  return mockDb.users.find((u) => u.id === id)
}

export function findUsersByNickname(nickname: string): MockUser[] {
  return mockDb.users.filter((u) =>
    u.nickname.toLowerCase().includes(nickname.toLowerCase())
  )
}

export async function verifyPassword(
  passwordHash: string,
  password: string
): Promise<boolean> {
  return bcryptjs.compare(password, passwordHash)
}

export function updateUser(id: string, updates: Partial<MockUser>): MockUser | null {
  const user = mockDb.users.find((u) => u.id === id)
  if (!user) return null

  Object.assign(user, updates, {
    updatedAt: new Date().toISOString(),
  })

  return user
}

// Shop operations
export function getShopItems(category?: string): MockShopItem[] {
  let items = mockDb.shopItems.filter((item) => item.isActive)
  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category)
  }
  return items
}

export function findShopItem(id: string): MockShopItem | undefined {
  return mockDb.shopItems.find((item) => item.id === id)
}

// Inventory operations
export function getInventory(userId: string): MockInventoryItem[] {
  return mockDb.inventory.filter((item) => item.userId === userId)
}

export function addInventoryItem(
  userId: string,
  shopItemId: string,
  quantity: number = 1,
  expirationDays?: number
): MockInventoryItem {
  const existingItem = mockDb.inventory.find(
    (item) => item.userId === userId && item.shopItemId === shopItemId
  )

  if (existingItem) {
    existingItem.quantity += quantity
    return existingItem
  }

  const item: MockInventoryItem = {
    id: `inv-${crypto.randomBytes(8).toString('hex')}`,
    userId,
    shopItemId,
    quantity,
    acquiredAt: new Date().toISOString(),
    isEquipped: false,
  }

  if (expirationDays) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)
    item.expiresAt = expiresAt.toISOString()
  }

  mockDb.inventory.push(item)
  return item
}

export function removeInventoryItem(
  userId: string,
  shopItemId: string,
  quantity: number = 1
): boolean {
  const item = mockDb.inventory.find(
    (inv) => inv.userId === userId && inv.shopItemId === shopItemId
  )

  if (!item) return false

  item.quantity -= quantity
  if (item.quantity <= 0) {
    const index = mockDb.inventory.indexOf(item)
    mockDb.inventory.splice(index, 1)
  }

  return true
}

export function isItemOwned(userId: string, shopItemId: string): boolean {
  return mockDb.inventory.some(
    (item) => item.userId === userId && item.shopItemId === shopItemId
  )
}

export function equipItem(userId: string, inventoryItemId: string): MockInventoryItem | null {
  const item = mockDb.inventory.find(
    (inv) => inv.userId === userId && inv.id === inventoryItemId
  )
  if (!item) return null

  // Check expiration
  if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
    return null
  }

  // Get shop item to determine category
  const shopItem = findShopItem(item.shopItemId)
  if (!shopItem) return null

  // Unequip other items in the same category
  mockDb.inventory
    .filter((inv) => {
      if (inv.userId !== userId || !inv.isEquipped) return false
      const invShopItem = findShopItem(inv.shopItemId)
      return invShopItem && invShopItem.category === shopItem.category
    })
    .forEach((inv) => {
      inv.isEquipped = false
    })

  item.isEquipped = true
  return item
}

export function unequipItem(userId: string, inventoryItemId: string): MockInventoryItem | null {
  const item = mockDb.inventory.find(
    (inv) => inv.userId === userId && inv.id === inventoryItemId
  )
  if (!item) return null

  item.isEquipped = false
  return item
}

export function getEquippedItems(userId: string): MockInventoryItem[] {
  return mockDb.inventory.filter(
    (item) => item.userId === userId && item.isEquipped
  )
}

// Minihome operations
export function getMinihome(userId: string): MockMinihome | undefined {
  return mockDb.minihomes.find((m) => m.userId === userId)
}

export function createMinihome(userId: string): MockMinihome {
  const existing = mockDb.minihomes.find((m) => m.userId === userId)
  if (existing) return existing

  const minihome: MockMinihome = {
    id: `minihome-${userId}`,
    userId,
    visitCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDb.minihomes.push(minihome)
  return minihome
}

export function updateMinihome(userId: string, updates: Partial<MockMinihome>): MockMinihome | null {
  const minihome = mockDb.minihomes.find((m) => m.userId === userId)
  if (!minihome) return null

  Object.assign(minihome, updates, {
    updatedAt: new Date().toISOString(),
  })

  return minihome
}

export function incrementVisitCount(userId: string): number {
  const minihome = mockDb.minihomes.find((m) => m.userId === userId)
  if (!minihome) return 0

  minihome.visitCount += 1
  return minihome.visitCount
}

// Guestbook operations
export function getGuestbookEntries(minihomeUserId: string): MockGuestbookEntry[] {
  return mockDb.guestbook
    .filter((entry) => entry.minihomeUserId === minihomeUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addGuestbookEntry(
  minihomeUserId: string,
  authorId: string,
  content: string
): MockGuestbookEntry | null {
  const author = findUserById(authorId)
  if (!author) return null

  const entry: MockGuestbookEntry = {
    id: `guestbook-${crypto.randomBytes(8).toString('hex')}`,
    minihomeUserId,
    authorId,
    authorNickname: author.nickname,
    authorAvatar: author.avatar,
    content,
    createdAt: new Date().toISOString(),
  }

  mockDb.guestbook.push(entry)
  return entry
}

export function deleteGuestbookEntry(entryId: string, userId: string): boolean {
  const index = mockDb.guestbook.findIndex((e) => e.id === entryId)
  if (index === -1) return false

  const entry = mockDb.guestbook[index]
  // Only minihome owner or entry author can delete
  if (entry.minihomeUserId !== userId && entry.authorId !== userId) return false

  mockDb.guestbook.splice(index, 1)
  return true
}

// Gem transaction operations
export function addGemTransaction(
  userId: string,
  amount: number,
  type: 'purchase' | 'reward' | 'refund' | 'charge',
  description: string,
  shopItemId?: string
): MockGemTransaction {
  const transaction: MockGemTransaction = {
    id: `tx-${crypto.randomBytes(8).toString('hex')}`,
    userId,
    amount,
    type,
    description,
    shopItemId,
    createdAt: new Date().toISOString(),
  }

  mockDb.gemTransactions.push(transaction)
  return transaction
}

export function getGemTransactions(userId: string): MockGemTransaction[] {
  return mockDb.gemTransactions
    .filter((tx) => tx.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Friendship operations
export function getFriends(userId: string): MockUser[] {
  const friendshipIds = mockDb.friendships
    .filter(
      (f) =>
        f.status === 'accepted' &&
        (f.userId1 === userId || f.userId2 === userId)
    )
    .map((f) => (f.userId1 === userId ? f.userId2 : f.userId1))

  return mockDb.users.filter((u) => friendshipIds.includes(u.id))
}

export function getPendingFriendRequests(userId: string): MockFriendship[] {
  return mockDb.friendships.filter(
    (f) => f.status === 'pending' && f.userId2 === userId && f.requestedBy !== userId
  )
}

export function createFriendRequest(
  fromUserId: string,
  toUserId: string
): MockFriendship | null {
  // Check if friendship already exists
  const existing = mockDb.friendships.find(
    (f) =>
      (f.userId1 === fromUserId && f.userId2 === toUserId) ||
      (f.userId1 === toUserId && f.userId2 === fromUserId)
  )

  if (existing) return null

  const friendship: MockFriendship = {
    id: `friend-${crypto.randomBytes(8).toString('hex')}`,
    userId1: fromUserId,
    userId2: toUserId,
    status: 'pending',
    requestedBy: fromUserId,
    createdAt: new Date().toISOString(),
  }

  mockDb.friendships.push(friendship)
  return friendship
}

export function acceptFriendRequest(friendshipId: string): MockFriendship | null {
  const friendship = mockDb.friendships.find((f) => f.id === friendshipId)
  if (!friendship) return null

  friendship.status = 'accepted'
  friendship.acceptedAt = new Date().toISOString()

  return friendship
}

export function rejectFriendRequest(friendshipId: string): boolean {
  const index = mockDb.friendships.findIndex((f) => f.id === friendshipId)
  if (index === -1) return false

  mockDb.friendships.splice(index, 1)
  return true
}

export function removeFriendship(friendshipId: string): boolean {
  const index = mockDb.friendships.findIndex((f) => f.id === friendshipId)
  if (index === -1) return false

  mockDb.friendships.splice(index, 1)
  return true
}

// Initialize database on import
initializeMockDb().catch(console.error)
