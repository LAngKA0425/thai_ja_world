# 태자월드 외부 연결 포인트 문서

## 개요

이 문서는 태자월드와 외부 서비스, 도메인, 써드파티 플랫폼을 연결하는 엔드포인트와 주소를 정의합니다. 도메인 구매 후 DNS 설정, 제3자 서비스 연동, 게이트웨이 설정 등에 참조하세요.

---

## 1. 도메인 및 DNS 구조

### 메인 도메인 구조

```
taeja.world/                 → 웹 앱 (메인 서비스)
taeja.world/admin/           → 관리자 대시보드
taeja.world/api/             → REST API
taeja.world/socket/          → WebSocket 서버 (프록시)
```

### 서브도메인 구조 (선택)

```
www.taeja.world/             → 웹 앱
api.taeja.world/             → REST API
admin.taeja.world/           → 관리자 대시보드
socket.taeja.world/          → WebSocket 서버 (별도 서버)
cdn.taeja.world/             → CDN (정적 자산)
```

### DNS 설정

**A 레코드 (웹/API/관리자):**
```
Host: @
Type: A
Value: <웹서버 IP주소>
TTL: 3600
```

**CNAME 레코드 (서브도메인):**
```
Host: api
Type: CNAME
Value: taeja.world
TTL: 3600

Host: admin
Type: CNAME
Value: taeja.world
TTL: 3600

Host: socket
Type: CNAME
Value: taeja.world
TTL: 3600
```

**MX 레코드 (이메일, 선택):**
```
Host: @
Type: MX
Value: mail.taeja.world
Priority: 10
TTL: 3600
```

**TXT 레코드 (DKIM, SPF):**
```
Host: @
Type: TXT
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600
```

---

## 2. 웹 앱 (Next.js) 연결

### 메인 페이지
```
URL: https://taeja.world/
방식: Server-Side Rendering (SSR)
인증: 선택 (비인증 사용자도 접근 가능)
```

### 로그인/회원가입
```
URL: https://taeja.world/auth/login
URL: https://taeja.world/auth/signup
방식: Client-Side Form + API
```

### 사용자 미니홈피
```
URL: https://taeja.world/users/:userId/minihome
방식: ISR (Incremental Static Regeneration)
```

### 광장 (Plaza)
```
URL: https://taeja.world/plaza
방식: SSR + Real-time Socket
인증: 필수
```

### 친구 목록
```
URL: https://taeja.world/friends
방식: SSR
인증: 필수
```

### 상점
```
URL: https://taeja.world/shop
방식: SSR + API
인증: 필수 (구매시)
```

### robots.txt
```
URL: https://taeja.world/robots.txt
경로: /sessions/vibrant-eloquent-hamilton/mnt/taeja/apps/web/public/robots.txt

내용:
User-agent: *
Allow: /
Allow: /users/
Allow: /plaza/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
```

### sitemap.xml
```
URL: https://taeja.world/sitemap.xml
경로: /sessions/vibrant-eloquent-hamilton/mnt/taeja/apps/web/src/app/sitemap.ts

포함 페이지:
- 홈페이지 (/)
- 공개 프로필 (users/:userId)
- 공개 미니홈피 페이지
```

---

## 3. 관리자 대시보드 (Next.js) 연결

### 관리자 페이지 접근
```
로컬: http://localhost:3002
프로덕션: https://taeja.world/admin/ 또는 https://admin.taeja.world

경로: /sessions/vibrant-eloquent-hamilton/mnt/taeja/apps/admin
```

### 관리자 인증
```
로그인 경로: https://taeja.world/admin/login
세션 저장소: httpOnly 쿠키 (NextAuth)
권한 검증: 미들웨어 (src/middleware.ts)
```

### 관리자 메인 대시보드
```
URL: https://taeja.world/admin/dashboard
기능: 통계, 최근 활동, 알림
```

### 사용자 관리
```
URL: https://taeja.world/admin/users
기능: 사용자 목록, 검색, 정지, 삭제
```

### 신고 관리
```
URL: https://taeja.world/admin/reports
기능: 신고 검토, 조치, 통계
```

### 공지사항 관리
```
URL: https://taeja.world/admin/notices
기능: 공지 작성, 수정, 삭제
```

### 확성기 관리
```
URL: https://taeja.world/admin/broadcasts
기능: 전체 공지 발송
```

---

## 4. REST API 엔드포인트

**기본 URL:** `https://taeja.world/api/` (또는 `https://api.taeja.world/`)

모든 API 응답은 다음 구조를 따릅니다:
```json
{
  "success": true,
  "data": { /* 응답 데이터 */ },
  "error": null,
  "timestamp": "2026-03-09T10:00:00Z"
}
```

### 4.1 인증 API

**로그인 (Sign In)**
```
POST /api/auth/login
Content-Type: application/json

요청:
{
  "email": "user@example.com",
  "password": "password"
}

응답:
{
  "success": true,
  "data": {
    "user": { "id", "email", "nickname", "avatar" },
    "token": "jwt-token-here"
  }
}
```

**회원가입 (Sign Up)**
```
POST /api/auth/signup
Content-Type: application/json

요청:
{
  "email": "newuser@example.com",
  "password": "password",
  "nickname": "사용자닉네임"
}

응답:
{
  "success": true,
  "data": {
    "user": { "id", "email", "nickname" },
    "token": "jwt-token-here"
  }
}
```

**현재 사용자 조회 (Get Current User)**
```
GET /api/auth/me
Authorization: Bearer <jwt-token>

응답:
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "nickname": "닉네임",
    "avatar": "image-url",
    "role": "user"
  }
}
```

---

### 4.2 사용자 API

**사용자 프로필 조회**
```
GET /api/users/:userId
인증: 선택

응답:
{
  "success": true,
  "data": {
    "id": "user-id",
    "nickname": "닉네임",
    "avatar": "image-url",
    "bio": "자기소개",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

**사용자 프로필 수정**
```
PUT /api/users/:userId
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "nickname": "새로운닉네임",
  "bio": "새로운소개"
}

응답:
{
  "success": true,
  "data": { /* 수정된 사용자 정보 */ }
}
```

---

### 4.3 미니홈피 API

**미니홈피 조회**
```
GET /api/users/:userId/minihome
인증: 선택

응답:
{
  "success": true,
  "data": {
    "userId": "user-id",
    "nickname": "사용자",
    "backgroundImage": "image-url",
    "bio": "자기소개",
    "guestbook": [ /* 방명록 */ ],
    "decorations": [ /* 꾸미기 아이템 */ ]
  }
}
```

**미니홈피 꾸미기 수정**
```
PUT /api/users/:userId/minihome
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "backgroundImage": "image-url",
  "decorations": [
    { "itemId": "item-1", "position": { "x": 10, "y": 20 } }
  ]
}

응답:
{
  "success": true,
  "data": { /* 업데이트된 미니홈피 */ }
}
```

**방명록 작성**
```
POST /api/users/:userId/minihome/guestbook
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "content": "방명록 내용",
  "visibleToOwner": true
}

응답:
{
  "success": true,
  "data": {
    "id": "guestbook-id",
    "authorId": "user-id",
    "content": "내용",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 4.4 광장 (Plaza) API

**광장 메시지 목록 조회**
```
GET /api/plaza?page=1&limit=50
인증: 필수

응답:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-id",
        "authorId": "user-id",
        "content": "메시지",
        "createdAt": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "pageSize": 50
  }
}
```

**광장 메시지 작성**
```
POST /api/plaza
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "content": "광장에 공유할 메시지"
}

응답:
{
  "success": true,
  "data": {
    "id": "message-id",
    "authorId": "user-id",
    "content": "내용",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 4.5 친구 API

**친구 목록 조회**
```
GET /api/friends
Authorization: Bearer <jwt-token>

응답:
{
  "success": true,
  "data": [
    {
      "id": "friendship-id",
      "friendId": "friend-id",
      "friendNickname": "친구닉네임",
      "friendAvatar": "image-url",
      "addedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**친구 추가**
```
POST /api/friends
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "friendId": "friend-user-id"
}

응답:
{
  "success": true,
  "data": {
    "id": "friendship-id",
    "friendId": "friend-id",
    "status": "pending"
  }
}
```

**친구 삭제**
```
DELETE /api/friends/:friendshipId
Authorization: Bearer <jwt-token>

응답:
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### 4.6 상점 API

**상품 목록 조회**
```
GET /api/shop/items?category=cosmetics&page=1
인증: 선택

응답:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item-id",
        "name": "상품명",
        "price": 1000,
        "category": "cosmetics",
        "image": "image-url"
      }
    ],
    "total": 100
  }
}
```

**상품 구매**
```
POST /api/shop/purchase
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "itemId": "item-id",
  "quantity": 1,
  "paymentMethod": "card"
}

응답:
{
  "success": true,
  "data": {
    "purchaseId": "purchase-id",
    "itemId": "item-id",
    "quantity": 1,
    "totalPrice": 1000,
    "status": "completed",
    "purchasedAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 4.7 인벤토리 API

**인벤토리 조회**
```
GET /api/inventory
Authorization: Bearer <jwt-token>

응답:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inventory-item-id",
        "itemId": "item-id",
        "itemName": "상품명",
        "quantity": 5,
        "acquiredAt": "2026-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 4.8 확성기 (Broadcast) API

**확성기 메시지 조회**
```
GET /api/broadcast?limit=100
인증: 선택

응답:
{
  "success": true,
  "data": {
    "broadcasts": [
      {
        "id": "broadcast-id",
        "message": "확성기 메시지",
        "authorId": "user-id",
        "createdAt": "2026-03-09T10:00:00Z"
      }
    ]
  }
}
```

**확성기 메시지 발송 (관리자)**
```
POST /api/admin/broadcasts
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

요청:
{
  "message": "전체 공지 메시지",
  "duration": 24  # 시간 단위
}

응답:
{
  "success": true,
  "data": {
    "id": "broadcast-id",
    "message": "메시지",
    "createdAt": "2026-03-09T10:00:00Z",
    "expiresAt": "2026-03-10T10:00:00Z"
  }
}
```

---

### 4.9 신고 API

**신고 제출**
```
POST /api/moderation/report
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "targetType": "user",  # user, message, comment
  "targetId": "target-id",
  "reason": "harassment",  # harassment, spam, inappropriate, other
  "description": "신고 상세 사유"
}

응답:
{
  "success": true,
  "data": {
    "id": "report-id",
    "status": "pending",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 4.10 차단 API

**사용자 차단**
```
POST /api/moderation/block
Authorization: Bearer <jwt-token>
Content-Type: application/json

요청:
{
  "blockedUserId": "user-id-to-block"
}

응답:
{
  "success": true,
  "data": {
    "id": "block-id",
    "blockedUserId": "user-id",
    "blockedAt": "2026-03-09T10:00:00Z"
  }
}
```

---

### 4.11 관리자 API

**사용자 관리**
```
GET /api/admin/users?page=1&limit=50&search=keyword
Authorization: Bearer <admin-jwt-token>

응답:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "email": "user@example.com",
        "nickname": "닉네임",
        "status": "active",
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "total": 1000
  }
}
```

**사용자 정지**
```
PUT /api/admin/users/:userId
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

요청:
{
  "status": "suspended",
  "reason": "정지 사유"
}

응답:
{
  "success": true,
  "data": { /* 수정된 사용자 정보 */ }
}
```

**신고 검토 (관리자)**
```
GET /api/admin/reports/:reportId
Authorization: Bearer <admin-jwt-token>

응답:
{
  "success": true,
  "data": {
    "id": "report-id",
    "reporter": { /* 신고자 정보 */ },
    "target": { /* 신고 대상 정보 */ },
    "reason": "신고 사유",
    "description": "상세 사유",
    "status": "pending",
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

---

## 5. WebSocket (실시간 통신) 연결

### Socket.io 서버

**로컬:** `ws://localhost:3001`
**프로덕션:** `wss://socket.taeja.world` 또는 `wss://taeja.world/socket`

### 광장 실시간 이벤트

```javascript
// 클라이언트 연결
const socket = io('https://socket.taeja.world', {
  auth: {
    token: 'jwt-token'
  }
});

// 광장 메시지 수신
socket.on('plaza:message', (data) => {
  // { id, authorId, content, createdAt }
});

// 광장 메시지 발송
socket.emit('plaza:send', {
  content: '광장 메시지'
}, (ack) => {
  console.log('메시지 전송됨');
});
```

### 친구 상태 업데이트

```javascript
// 친구 온/오프라인 상태
socket.on('friend:status', (data) => {
  // { friendId, status: 'online' | 'offline' }
});
```

### 미니홈피 방문 알림

```javascript
socket.on('minihome:visited', (data) => {
  // { visitorId, visitorNickname, timestamp }
});
```

---

## 6. OAuth 콜백 URL

### Google OAuth Callback

**개발 환경:**
```
http://localhost:3000/api/auth/callback/google
```

**프로덕션 환경:**
```
https://taeja.world/api/auth/callback/google
```

**Google Console 설정:**
1. API 콘솔에서 OAuth 동의 화면 구성
2. "승인된 리다이렉션 URI" 추가:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://taeja.world/api/auth/callback/google`

---

### Kakao OAuth Callback

**개발 환경:**
```
http://localhost:3000/api/auth/callback/kakao
```

**프로덕션 환경:**
```
https://taeja.world/api/auth/callback/kakao
```

**Kakao Developers 설정:**
1. 앱 설정 → 플랫폼 → Web
2. Redirect URI 등록:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://taeja.world`

---

## 7. 결제 Webhook

### Toss Payments Webhook

**Webhook 수신 경로:**
```
POST https://taeja.world/api/payments/webhook
```

**Webhook 이벤트 타입:**
```
- payment.success
- payment.failed
- payment.cancelled
- order.completed
```

**Webhook 서명 검증:**
```
Header: X-TOSS-PAYMENT-SIGNATURE
값: HMAC-SHA256(body, WEBHOOK_SECRET)
```

**Webhook 설정:**
1. Toss Payments 개발자 센터 → Webhook
2. URL 등록: `https://taeja.world/api/payments/webhook`
3. 이벤트 선택 및 저장

---

## 8. 이메일 발송 포인트

### 가입 확인 이메일
```
From: noreply@taeja.world
To: user@example.com
Subject: 태자월드 가입을 환영합니다!

본문: 이메일 확인 링크
https://taeja.world/auth/verify?token=<verification-token>
```

### 비밀번호 재설정 이메일
```
From: noreply@taeja.world
To: user@example.com
Subject: 비밀번호 재설정

본문: 비밀번호 재설정 링크
https://taeja.world/auth/reset-password?token=<reset-token>
```

### 신고 결과 알림
```
From: noreply@taeja.world
To: reporter@example.com
Subject: 신고 처리 결과

본문: 신고 처리 상태 및 조치 내용
```

---

## 9. SEO 및 메타데이터

### Open Graph (소셜 공유)

```html
<meta property="og:title" content="태자월드 - 가상 커뮤니티">
<meta property="og:description" content="친구들과 함께 즐기는 가상 공간">
<meta property="og:image" content="https://taeja.world/og-image.png">
<meta property="og:url" content="https://taeja.world">
<meta property="og:type" content="website">
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="태자월드">
<meta name="twitter:description" content="친구들과 함께 즐기는 가상 공간">
<meta name="twitter:image" content="https://taeja.world/twitter-image.png">
```

### 구조화된 데이터 (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "태자월드",
  "url": "https://taeja.world",
  "description": "가상 커뮤니티 플랫폼",
  "applicationCategory": "SocialNetworking",
  "potentialAction": {
    "@type": "CreateAction",
    "target": "https://taeja.world/auth/signup"
  }
}
```

---

## 10. 모니터링 및 분석

### Google Analytics 추적

```javascript
// gtag.js 설정
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');

// 이벤트 추적
gtag('event', 'user_signup', {
  'user_id': user_id
});
```

### Sentry 에러 추적

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  environment: process.env.NODE_ENV,
});
```

---

## 11. 체크리스트

배포 전 외부 연결 확인:

- [ ] 도메인 DNS 설정 완료
- [ ] SSL 인증서 설치 (HTTPS)
- [ ] Google OAuth 리다이렉트 URI 등록
- [ ] Kakao OAuth 리다이렉트 URI 등록
- [ ] Toss Payments Webhook URL 등록
- [ ] 메일 서비스 DKIM/SPF 설정
- [ ] 파일 스토리지 버킷 생성
- [ ] CDN 설정 (선택)
- [ ] 모니터링 도구 연동 (Analytics, Sentry)

---

**마지막 업데이트:** 2026-03-09
