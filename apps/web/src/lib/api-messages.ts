export const apiMessages = {
  auth: {
    tokenRequired: '인증 토큰이 필요합니다.',
    invalidToken: '유효하지 않은 토큰입니다.',
  },
  errors: {
    userNotFound: '사용자를 찾을 수 없습니다.',
    badRequest: '잘못된 요청입니다.',
    notFound: '요청한 리소스를 찾을 수 없습니다.',
    serverError: '서버 오류가 발생했습니다.',
  },
  broadcast: {
    cooldownMessage: '초 후에 다시 시도해 주세요.',
  },
  shop: {
    itemIdRequired: '상품 ID가 필요합니다.',
    itemNotFound: '상품을 찾을 수 없습니다.',
    itemNotForSale: '판매 중인 상품이 아닙니다.',
    alreadyOwned: '이미 보유한 상품입니다.',
    insufficientStylePoints: '스타일 포인트가 부족합니다.',
    insufficientBalance: '잔액이 부족합니다.',
    purchaseFailed: '구매에 실패했습니다.',
    purchaseDescription: '구매',
    unknownItem: '알 수 없는 아이템',
  },
  inventory: {
    equipFailed: '아이템 장착에 실패했습니다.',
    unequipFailed: '아이템 해제에 실패했습니다.',
  },
} as const
