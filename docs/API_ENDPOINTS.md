# 태자월드 API 엔드포인트 전체 목록

## 개요

이 문서는 태자월드의 모든 REST API 엔드포인트를 나열합니다. 각 엔드포인트의 HTTP 메서드, 경로, 설명, 인증 필요 여부, 요청/응답 형식을 포함합니다.

**기본 URL:** `https://taeja.world/api`

---

## 응답 형식 표준

모든 API 응답은 다음 구조를 따릅니다:

```json
{
  "success": true,
  "data": { /* 응답 데이터 */ },
  "error": null,
  "timestamp": "2026-03-09T10:00:00Z"
}
```

**에러 응답:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "요청이 유효하지 않습니다.",
    "details": { /* 상세 정보 */ }
  },
  "timestamp": "2026-03-09T10:00:00Z"
}
```

---

## 1. 인증 (Authentication)

### 1.1 회원가입

```
POST /auth/signup

설명: 새로운 사용자 계정 생성
인증: 불필요

요청:
{
  "email": "newuser@example.com",
  "password": "securePassword123!",
  "nickname": "사용자닉네임"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "newuser@example.com",
    "nickname": "사용자닉네임",
    "avatar": null,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러 (400):
- EMAIL_ALREADY_EXISTS: 이미 가입된 이메일
- INVALID_PASSWORD: 비밀번호 형식 오류
- INVALID_EMAIL: 이메일 형식 오류
```

---

### 1.2 로그인

```
POST /auth/login

설명: 사용자 인증 및 JWT 토큰 발급
인증: 불필요

요청:
{
  "email": "user@example.com",
  "password": "password123"
}

응답 (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "nickname": "닉네임",
      "avatar": "https://...",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  }
}

에러 (401):
- INVALID_CREDENTIALS: 이메일 또는 비밀번호 오류
- USER_NOT_FOUND: 사용자 찾을 수 없음
- USER_SUSPENDED: 계정 정지됨
```

---

### 1.3 현재 사용자 조회

```
GET /auth/me

설명: 현재 로그인한 사용자 정보 조회
인증: 필수

요청 헤더:
Authorization: Bearer <jwt-token>

응답 (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "nickname": "닉네임",
    "avatar": "https://...",
    "bio": "자기소개",
    "role": "user",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}

에러 (401):
- INVALID_TOKEN: 토큰 유효하지 않음
- TOKEN_EXPIRED: 토큰 만료됨
```

---

### 1.4 로그아웃

```
POST /auth/logout

설명: 사용자 세션 종료
인증: 필수

요청 헤더:
Authorization: Bearer <jwt-token>

응답 (200):
{
  "success": true,
  "data": { "message": "로그아웃 성공" }
}
```

---

### 1.5 비밀번호 재설정 요청

```
POST /auth/forgot-password

설명: 비밀번호 재설정 링크 이메일 발송
인증: 불필요

요청:
{
  "email": "user@example.com"
}

응답 (200):
{
  "success": true,
  "data": {
    "message": "비밀번호 재설정 링크를 이메일로 발송했습니다."
  }
}
```

---

### 1.6 비밀번호 재설정

```
POST /auth/reset-password

설명: 비밀번호 재설정
인증: 불필요

요청:
{
  "token": "reset-token",
  "newPassword": "newPassword123!"
}

응답 (200):
{
  "success": true,
  "data": { "message": "비밀번호가 재설정되었습니다." }
}

에러 (400):
- INVALID_TOKEN: 토큰 유효하지 않음
- TOKEN_EXPIRED: 토큰 만료됨
```

---

## 2. 사용자 (Users)

### 2.1 사용자 프로필 조회

```
GET /users/:userId

설명: 특정 사용자의 프로필 조회
인증: 불필요

경로 매개변수:
- userId (string): 사용자 ID

응답 (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "nickname": "닉네임",
    "avatar": "https://...",
    "bio": "자기소개",
    "createdAt": "2026-01-01T00:00:00Z",
    "friendsCount": 42,
    "isFollowing": false,
    "isBlocked": false
  }
}

에러 (404):
- USER_NOT_FOUND: 사용자 찾을 수 없음
```

---

### 2.2 사용자 프로필 업데이트

```
PUT /users/:userId

설명: 현재 사용자의 프로필 업데이트
인증: 필수 (본인만)

요청:
{
  "nickname": "새로운닉네임",
  "bio": "새로운소개",
  "avatar": "https://new-avatar-url"
}

응답 (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "nickname": "새로운닉네임",
    "bio": "새로운소개",
    "avatar": "https://new-avatar-url",
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}

에러 (403):
- FORBIDDEN: 다른 사용자의 프로필 수정 불가
```

---

### 2.3 사용자 삭제

```
DELETE /users/:userId

설명: 사용자 계정 삭제
인증: 필수 (본인만)

응답 (200):
{
  "success": true,
  "data": { "message": "계정이 삭제되었습니다." }
}
```

---

### 2.4 사용자 검색

```
GET /users?search=keyword&page=1&limit=20

설명: 사용자 검색
인증: 불필요

쿼리 매개변수:
- search (string): 검색 키워드 (닉네임, 이메일)
- page (number): 페이지 번호 (기본: 1)
- limit (number): 한 페이지 항목 수 (기본: 20, 최대: 100)

응답 (200):
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-1",
        "nickname": "사용자1",
        "avatar": "https://...",
        "bio": "자기소개"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 3. 미니홈피 (Minihome)

### 3.1 미니홈피 조회

```
GET /users/:userId/minihome

설명: 사용자의 미니홈피 조회
인증: 불필요

응답 (200):
{
  "success": true,
  "data": {
    "userId": "user-123",
    "nickname": "사용자",
    "avatar": "https://...",
    "backgroundImage": "https://...",
    "bio": "자기소개",
    "decorations": [
      {
        "id": "deco-1",
        "itemId": "item-1",
        "position": { "x": 100, "y": 200 },
        "rotation": 0,
        "scale": 1
      }
    ],
    "visitCount": 1000,
    "lastVisit": "2026-03-09T10:00:00Z"
  }
}

에러 (404):
- USER_NOT_FOUND: 사용자 찾을 수 없음
```

---

### 3.2 미니홈피 배경 변경

```
PUT /users/:userId/minihome

설명: 미니홈피 배경 및 꾸미기 업데이트
인증: 필수 (본인만)

요청:
{
  "backgroundImage": "https://new-bg-url",
  "decorations": [
    {
      "itemId": "item-1",
      "position": { "x": 100, "y": 200 },
      "rotation": 0,
      "scale": 1
    }
  ]
}

응답 (200):
{
  "success": true,
  "data": {
    "userId": "user-123",
    "backgroundImage": "https://new-bg-url",
    "decorations": [ /* ... */ ],
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}

에러 (403):
- FORBIDDEN: 다른 사용자의 미니홈피 수정 불가
```

---

### 3.3 미니홈피 방문

```
POST /users/:userId/minihome/visit

설명: 미니홈피 방문 기록 (조회수 증가)
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "visitCount": 1001,
    "lastVisit": "2026-03-09T10:00:00Z"
  }
}
```

---

### 3.4 방명록 조회

```
GET /users/:userId/minihome/guestbook?page=1&limit=20

설명: 미니홈피 방명록 조회
인증: 불필요

응답 (200):
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "guest-1",
        "authorId": "user-456",
        "authorNickname": "방문자",
        "content": "방문했습니다!",
        "createdAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1
  }
}
```

---

### 3.5 방명록 작성

```
POST /users/:userId/minihome/guestbook

설명: 미니홈피에 방명록 남기기
인증: 필수

요청:
{
  "content": "방문했습니다! 좋아요.",
  "visibleToOwner": true
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "guest-1",
    "authorId": "user-123",
    "authorNickname": "작성자",
    "content": "방문했습니다! 좋아요.",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러 (400):
- CONTENT_REQUIRED: 내용 필수
- CONTENT_TOO_LONG: 내용이 너무 깁니다 (최대 500자)
```

---

### 3.6 방명록 삭제

```
DELETE /users/:userId/minihome/guestbook/:guestbookId

설명: 방명록 삭제
인증: 필수 (본인 또는 미니홈피 소유자)

응답 (200):
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## 4. 광장 (Plaza)

### 4.1 광장 메시지 목록 조회

```
GET /plaza?page=1&limit=50&sort=latest

설명: 광장의 모든 메시지 조회
인증: 필수

쿼리 매개변수:
- page (number): 페이지 번호
- limit (number): 한 페이지 항목 수 (기본: 50, 최대: 200)
- sort (string): 정렬 순서 (latest | popular)

응답 (200):
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-1",
        "authorId": "user-123",
        "authorNickname": "사용자",
        "authorAvatar": "https://...",
        "content": "광장 메시지",
        "likes": 42,
        "replies": 5,
        "createdAt": "2026-03-09T10:00:00Z",
        "isLiked": false
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 50
  }
}
```

---

### 4.2 광장 메시지 작성

```
POST /plaza

설명: 광장에 메시지 작성
인증: 필수

요청:
{
  "content": "광장에 공유할 메시지",
  "imageUrl": "https://optional-image-url"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "message-1",
    "authorId": "user-123",
    "content": "광장에 공유할 메시지",
    "likes": 0,
    "replies": 0,
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러 (400):
- CONTENT_REQUIRED: 내용 필수
- CONTENT_TOO_LONG: 내용이 너무 깁니다 (최대 1000자)
```

---

### 4.3 광장 메시지 조회

```
GET /plaza/:messageId

설명: 특정 광장 메시지 조회
인증: 불필요

응답 (200):
{
  "success": true,
  "data": {
    "id": "message-1",
    "authorId": "user-123",
    "content": "메시지",
    "likes": 42,
    "createdAt": "2026-03-09T10:00:00Z",
    "replies": [ /* 댓글 */ ]
  }
}
```

---

### 4.4 광장 메시지 좋아요

```
POST /plaza/:messageId/like

설명: 광장 메시지에 좋아요 추가
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "messageId": "message-1",
    "likes": 43,
    "isLiked": true
  }
}
```

---

### 4.5 광장 메시지 좋아요 취소

```
DELETE /plaza/:messageId/like

설명: 광장 메시지에 좋아요 취소
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "messageId": "message-1",
    "likes": 42,
    "isLiked": false
  }
}
```

---

### 4.6 광장 메시지 삭제

```
DELETE /plaza/:messageId

설명: 광장 메시지 삭제
인증: 필수 (본인 또는 관리자)

응답 (200):
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### 4.7 광장 댓글 작성

```
POST /plaza/:messageId/replies

설명: 광장 메시지에 댓글 작성
인증: 필수

요청:
{
  "content": "댓글 내용"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "reply-1",
    "messageId": "message-1",
    "authorId": "user-123",
    "content": "댓글 내용",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

## 5. 친구 (Friends)

### 5.1 친구 목록 조회

```
GET /friends?page=1&limit=50

설명: 현재 사용자의 친구 목록 조회
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "friends": [
      {
        "id": "friendship-1",
        "friendId": "user-456",
        "friendNickname": "친구",
        "friendAvatar": "https://...",
        "addedAt": "2026-01-01T00:00:00Z",
        "isOnline": true
      }
    ],
    "total": 100,
    "page": 1
  }
}
```

---

### 5.2 친구 추가

```
POST /friends

설명: 다른 사용자를 친구로 추가
인증: 필수

요청:
{
  "friendId": "user-456"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "friendship-1",
    "friendId": "user-456",
    "status": "pending",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러 (400):
- ALREADY_FRIENDS: 이미 친구입니다
- FRIEND_REQUEST_PENDING: 친구 요청 대기 중
```

---

### 5.3 친구 요청 승인

```
PUT /friends/:friendshipId/accept

설명: 친구 요청 승인
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "id": "friendship-1",
    "status": "accepted",
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 5.4 친구 요청 거절

```
PUT /friends/:friendshipId/reject

설명: 친구 요청 거절
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "id": "friendship-1",
    "status": "rejected",
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 5.5 친구 삭제

```
DELETE /friends/:friendshipId

설명: 친구 삭제
인증: 필수

응답 (200):
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### 5.6 친구 요청 목록

```
GET /friends/requests?page=1&limit=50

설명: 받은 친구 요청 목록 조회
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "friendship-1",
        "fromId": "user-123",
        "fromNickname": "사용자",
        "fromAvatar": "https://...",
        "createdAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1
  }
}
```

---

## 6. 상점 (Shop)

### 6.1 상품 목록 조회

```
GET /shop/items?category=cosmetics&page=1&limit=20

설명: 상점의 상품 목록 조회
인증: 불필요

쿼리 매개변수:
- category (string): 상품 카테고리 (cosmetics | furniture | themes | etc)
- page (number): 페이지 번호
- limit (number): 한 페이지 항목 수 (기본: 20)
- sort (string): 정렬 (newest | popular | price_asc | price_desc)

응답 (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-1",
        "name": "향수",
        "description": "향기로운 향수",
        "category": "cosmetics",
        "price": 1000,
        "image": "https://...",
        "inStock": true
      }
    ],
    "total": 100,
    "page": 1,
    "categories": ["cosmetics", "furniture", "themes"]
  }
}
```

---

### 6.2 상품 상세 조회

```
GET /shop/items/:itemId

설명: 특정 상품의 상세 정보 조회
인증: 불필요

응답 (200):
{
  "success": true,
  "data": {
    "id": "item-1",
    "name": "향수",
    "description": "향기로운 향수",
    "category": "cosmetics",
    "price": 1000,
    "image": "https://...",
    "inStock": true,
    "purchaseCount": 500,
    "rating": 4.5
  }
}
```

---

### 6.3 상품 구매

```
POST /shop/purchase

설명: 상품 구매 (포인트/실제 결제)
인증: 필수

요청:
{
  "itemId": "item-1",
  "quantity": 1,
  "paymentMethod": "card"  # card | points
}

응답 (201):
{
  "success": true,
  "data": {
    "purchaseId": "purchase-1",
    "itemId": "item-1",
    "itemName": "향수",
    "quantity": 1,
    "totalPrice": 1000,
    "paymentMethod": "card",
    "status": "pending",  # pending | completed | failed
    "paymentUrl": "https://payment-gateway.com/...",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러:
- ITEM_NOT_FOUND: 상품 찾을 수 없음
- INSUFFICIENT_BALANCE: 포인트 부족
- OUT_OF_STOCK: 재고 부족
```

---

### 6.4 구매 이력 조회

```
GET /shop/purchases?page=1&limit=20

설명: 현재 사용자의 구매 이력 조회
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": "purchase-1",
        "itemId": "item-1",
        "itemName": "향수",
        "quantity": 1,
        "totalPrice": 1000,
        "status": "completed",
        "purchasedAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1
  }
}
```

---

## 7. 인벤토리 (Inventory)

### 7.1 인벤토리 조회

```
GET /inventory?category=all

설명: 현재 사용자의 인벤토리 조회
인증: 필수

쿼리 매개변수:
- category (string): 필터 (all | cosmetics | furniture | themes)

응답 (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inv-1",
        "itemId": "item-1",
        "itemName": "향수",
        "quantity": 3,
        "category": "cosmetics",
        "acquiredAt": "2026-01-01T00:00:00Z",
        "equipped": false
      }
    ],
    "totalItems": 45
  }
}
```

---

### 7.2 아이템 장착

```
PUT /inventory/:inventoryId/equip

설명: 아이템을 미니홈피에 장착
인증: 필수

요청:
{
  "position": { "x": 100, "y": 200 },
  "rotation": 0,
  "scale": 1
}

응답 (200):
{
  "success": true,
  "data": {
    "id": "inv-1",
    "equipped": true,
    "position": { "x": 100, "y": 200 }
  }
}
```

---

### 7.3 아이템 해제

```
PUT /inventory/:inventoryId/unequip

설명: 아이템 장착 해제
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "id": "inv-1",
    "equipped": false
  }
}
```

---

## 8. 확성기 (Broadcast)

### 8.1 확성기 메시지 조회

```
GET /broadcast?limit=100

설명: 현재 활성 확성기 메시지 조회
인증: 불필요

응답 (200):
{
  "success": true,
  "data": {
    "broadcasts": [
      {
        "id": "broadcast-1",
        "message": "새로운 아이템이 출시되었습니다!",
        "type": "info",  # info | warning | urgent
        "createdAt": "2026-03-09T10:00:00Z",
        "expiresAt": "2026-03-10T10:00:00Z"
      }
    ]
  }
}
```

---

## 9. 신고 및 차단 (Moderation)

### 9.1 사용자 신고

```
POST /moderation/report

설명: 사용자/메시지 신고
인증: 필수

요청:
{
  "targetType": "user",  # user | message | guestbook
  "targetId": "user-456",
  "reason": "harassment",  # harassment | spam | inappropriate | scam | other
  "description": "상세한 신고 사유"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "report-1",
    "status": "pending",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}

에러:
- ALREADY_REPORTED: 이미 신고했습니다
- INVALID_TARGET: 신고 대상 찾을 수 없음
```

---

### 9.2 사용자 차단

```
POST /moderation/block

설명: 사용자 차단
인증: 필수

요청:
{
  "blockedUserId": "user-456"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "block-1",
    "blockedUserId": "user-456",
    "blockedAt": "2026-03-09T10:00:00Z"
  }
}

에러:
- ALREADY_BLOCKED: 이미 차단했습니다
```

---

### 9.3 차단 목록 조회

```
GET /moderation/blocked?page=1&limit=50

설명: 현재 사용자가 차단한 사용자 목록
인증: 필수

응답 (200):
{
  "success": true,
  "data": {
    "blocked": [
      {
        "id": "block-1",
        "blockedUserId": "user-456",
        "blockedNickname": "사용자",
        "blockedAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 5
  }
}
```

---

### 9.4 차단 해제

```
DELETE /moderation/block/:blockId

설명: 사용자 차단 해제
인증: 필수

응답 (200):
{
  "success": true,
  "data": { "unblocked": true }
}
```

---

## 10. 관리자 전용 API

### 10.1 사용자 관리

**사용자 목록 조회**
```
GET /admin/users?page=1&limit=50&search=keyword&status=active

설명: 모든 사용자 목록 (관리자만)
인증: 필수 (관리자 권한)

응답 (200):
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-1",
        "email": "user@example.com",
        "nickname": "닉네임",
        "avatar": "https://...",
        "status": "active",  # active | suspended | banned
        "createdAt": "2026-01-01T00:00:00Z",
        "lastLogin": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1
  }
}
```

---

**사용자 정보 수정**
```
PUT /admin/users/:userId

설명: 사용자 상태 변경 (관리자만)
인증: 필수 (관리자 권한)

요청:
{
  "status": "suspended",  # active | suspended | banned
  "reason": "정지 사유",
  "suspendUntil": "2026-04-09T10:00:00Z"
}

응답 (200):
{
  "success": true,
  "data": {
    "id": "user-1",
    "status": "suspended",
    "reason": "정지 사유",
    "suspendUntil": "2026-04-09T10:00:00Z"
  }
}
```

---

**사용자 삭제**
```
DELETE /admin/users/:userId

설명: 사용자 계정 삭제 (관리자만)
인증: 필수 (관리자 권한)

응답 (200):
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### 10.2 신고 관리

**신고 목록 조회**
```
GET /admin/reports?page=1&status=pending

설명: 모든 신고 목록 (관리자만)
인증: 필수 (관리자 권한)

응답 (200):
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-1",
        "reporterId": "user-1",
        "targetType": "user",
        "targetId": "user-2",
        "reason": "harassment",
        "description": "상세 사유",
        "status": "pending",  # pending | reviewed | resolved | dismissed
        "createdAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1
  }
}
```

---

**신고 검토**
```
PUT /admin/reports/:reportId

설명: 신고 처리 (관리자만)
인증: 필수 (관리자 권한)

요청:
{
  "status": "resolved",
  "action": "suspend",  # none | suspend | ban
  "actionDuration": 7,  # 일 단위
  "message": "처리 결과 메시지"
}

응답 (200):
{
  "success": true,
  "data": {
    "id": "report-1",
    "status": "resolved",
    "action": "suspend",
    "updatedAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 10.3 공지사항 관리

**공지사항 작성**
```
POST /admin/notices

설명: 새로운 공지사항 작성 (관리자만)
인증: 필수 (관리자 권한)

요청:
{
  "title": "공지사항 제목",
  "content": "공지사항 본문",
  "priority": "high",  # low | normal | high
  "publishAt": "2026-03-09T10:00:00Z",
  "expireAt": "2026-03-16T10:00:00Z"
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "notice-1",
    "title": "공지사항 제목",
    "content": "공지사항 본문",
    "priority": "high",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

**공지사항 목록**
```
GET /admin/notices?page=1

설명: 공지사항 목록 (관리자만)
인증: 필수 (관리자 권한)

응답 (200):
{
  "success": true,
  "data": {
    "notices": [
      {
        "id": "notice-1",
        "title": "공지사항 제목",
        "priority": "high",
        "createdAt": "2026-03-09T10:00:00Z",
        "publishedAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1
  }
}
```

---

### 10.4 확성기 관리

**확성기 메시지 발송**
```
POST /admin/broadcasts

설명: 전체 사용자에게 확성기 메시지 발송 (관리자만)
인증: 필수 (관리자 권한)

요청:
{
  "message": "중요한 공지사항입니다!",
  "type": "info",  # info | warning | urgent
  "duration": 24  # 시간 단위
}

응답 (201):
{
  "success": true,
  "data": {
    "id": "broadcast-1",
    "message": "중요한 공지사항입니다!",
    "type": "info",
    "createdAt": "2026-03-09T10:00:00Z",
    "expiresAt": "2026-03-10T10:00:00Z"
  }
}
```

---

### 10.5 통계 조회

**대시보드 통계**
```
GET /admin/statistics

설명: 대시보드 통계 (관리자만)
인증: 필수 (관리자 권한)

응답 (200):
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "new24h": 5,
      "active30d": 450
    },
    "engagement": {
      "plazaMessages24h": 1200,
      "friendRequests24h": 300,
      "purchases24h": 150
    },
    "reports": {
      "pending": 10,
      "today": 5
    }
  }
}
```

---

## 11. 결제 API (결제 게이트웨이)

### 11.1 결제 Webhook

**Toss Payments Webhook**
```
POST /api/payments/webhook

설명: 결제 게이트웨이에서 결제 결과 알림
인증: Webhook 서명 검증

요청:
{
  "transactionId": "toss-1234567890",
  "orderId": "purchase-1",
  "status": "success",  # success | failure | cancelled
  "amount": 1000,
  "paymentMethod": "card",
  "timestamp": "2026-03-09T10:00:00Z"
}

응답 (200):
{
  "success": true,
  "data": { "processed": true }
}
```

---

## 12. 파일 업로드 API

### 12.1 아바타 업로드

```
POST /upload/avatar

설명: 사용자 아바타 이미지 업로드
인증: 필수

요청:
- Content-Type: multipart/form-data
- file: 이미지 파일 (max 5MB, jpeg/png)

응답 (201):
{
  "success": true,
  "data": {
    "url": "https://cdn.taeja.world/avatars/user-123.jpg",
    "size": 102400
  }
}
```

---

### 12.2 미니홈피 배경 업로드

```
POST /upload/minihome-background

설명: 미니홈피 배경 이미지 업로드
인증: 필수

응답 (201):
{
  "success": true,
  "data": {
    "url": "https://cdn.taeja.world/backgrounds/user-123.jpg",
    "size": 512000
  }
}
```

---

## HTTP 상태 코드

| 상태 코드 | 의미 | 예시 |
|---------|------|------|
| 200 | 성공 | 데이터 조회, 업데이트 성공 |
| 201 | 생성됨 | 새 리소스 생성 성공 |
| 400 | 잘못된 요청 | 필수 필드 누락, 형식 오류 |
| 401 | 인증 필요 | 토큰 없음, 만료됨 |
| 403 | 접근 거부 | 권한 부족 |
| 404 | 찾을 수 없음 | 리소스 존재하지 않음 |
| 409 | 충돌 | 중복 신고, 이미 친구 등 |
| 429 | 요청 제한 | Rate limit 초과 |
| 500 | 서버 에러 | 서버 오류 |

---

## Rate Limiting

```
- 일반 사용자: 100 requests/minute
- 관리자: 500 requests/minute
- 로그인 미필수 엔드포인트: 60 requests/minute per IP
```

---

## 인증 헤더

모든 인증 필수 엔드포인트는 다음 헤더를 포함해야 합니다:

```
Authorization: Bearer <jwt-token>
```

---

**마지막 업데이트:** 2026-03-09
