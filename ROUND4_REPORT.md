# 태자월드 4차 라운드 작업 보고서

---

## 1. 이번 라운드 작업 범위

"태자월드 1차 출시안이 실제로 돌아가는 상태"를 만드는 것.

- 미니홈피 클릭 시 404 → 정상 진입 수정
- 로그인 후 프로필 클릭 → 로그인 페이지 무한 리다이렉트 수정
- 상점 상품 밀도 강화 (10개 → 42개+)
- 젬/상점/인벤토리/구매 플로우 엔드투엔드 연결
- 미니홈피 꾸미기(스킨/BGM) 기능 구현
- 방명록 CRUD 연결
- 방문자 카운트 연결
- 배포 직전 환경변수 정리

---

## 2. 수정 파일 목록

| # | 파일 경로 | 라인수 |
|---|----------|--------|
| 1 | `apps/web/src/lib/mock-db.ts` | 582 |
| 2 | `apps/web/src/stores/auth-store.ts` | 195 |
| 3 | `apps/web/src/components/layout/BottomNav.tsx` | 46 |
| 4 | `apps/web/src/hooks/useMinihome.ts` | 302 |
| 5 | `apps/web/src/app/api/users/[userId]/minihome/route.ts` | 204 |
| 6 | `apps/web/src/app/api/users/[userId]/minihome/guestbook/route.ts` | 172 |
| 7 | `apps/web/src/app/api/shop/items/route.ts` | 29 |
| 8 | `apps/web/src/app/api/shop/purchase/route.ts` | 150 |
| 9 | `apps/web/src/app/api/inventory/route.ts` | 150 |
| 10 | `apps/web/src/app/(main)/shop/page.tsx` | 145 |
| 11 | `apps/web/src/app/(main)/minihome/[userId]/page.tsx` | 426 |
| 12 | `apps/web/src/app/(main)/home/page.tsx` | 36 |
| 13 | `apps/web/src/app/(main)/layout.tsx` | 51 |
| 14 | `apps/web/src/app/(main)/inventory/page.tsx` | 135 |
| 15 | `apps/web/src/stores/inventory-store.ts` | 96 |
| 16 | `apps/web/src/components/shop/ShopItemCard.tsx` | 127 |
| 17 | `apps/web/src/components/shop/PurchaseModal.tsx` | 102 |
| 18 | `apps/web/src/components/inventory/InventoryItemCard.tsx` | 99 |
| 19 | `.env` | 30 |
| 20 | `.env.example` | 76 |

---

## 3. 각 파일 수정 이유

| # | 파일 | 수정 이유 |
|---|------|----------|
| 1 | `mock-db.ts` | 인메모리 DB 전면 확장. 미니홈피 모델, 젬 트랜잭션, 방명록 중앙 관리, 장착/해제, 42+ 시드 아이템 추가. 신규 유저 기본 젬 500으로 상향 |
| 2 | `auth-store.ts` | initializeAuth()에서 500/네트워크 에러 시에도 토큰 삭제하던 버그 수정. 401/403만 토큰 클리어 |
| 3 | `BottomNav.tsx` | 미니홈피 링크가 `/home`(정적)이었던 것을 `/minihome/${userId}`(동적)으로 수정 |
| 4 | `useMinihome.ts` | API 경로 `/api/minihome/${userId}` → `/api/users/${userId}/minihome`로 수정. 스킨/BGM 변경 메서드 추가 |
| 5 | `minihome/route.ts` | GET 응답에 방명록, 스킨명, BGM명 포함. PUT 핸들러 추가 (스킨/BGM/바이오 변경, 보유 검증, 만료 검증) |
| 6 | `guestbook/route.ts` | 로컬 Map 대신 중앙 mock-db 함수 사용으로 전환. DELETE 핸들러 query param 방식 |
| 7 | `shop/items/route.ts` | isActive 필드 응답에 포함 |
| 8 | `shop/purchase/route.ts` | 중복 구매 방지, isActive 검증, 젬 트랜잭션 기록, 응답에 isEquipped 포함 |
| 9 | `inventory/route.ts` | PUT 핸들러 추가 (equip/unequip 액션). isEquipped 필드 응답 |
| 10 | `shop/page.tsx` | 카테고리 탭 확장 (top/bottom/shoes/accessory/skin/bgm/effect/broadcast) |
| 11 | `minihome/[userId]/page.tsx` | 꾸미기 탭 전면 구현 (스킨/BGM 선택, 장착, 만료 체크, 빈 상태 처리) |
| 12 | `home/page.tsx` | 정적 콘텐츠 → 사용자 미니홈피로 리다이렉트 |
| 13 | `layout.tsx` | hasCheckedAuth 상태 추가로 인증 체크 완료 전 깜빡임 방지 |
| 14 | `inventory/page.tsx` | 신규 카테고리 매칭 |
| 15 | `inventory-store.ts` | isEquipped 필드 인터페이스 추가 |
| 16 | `ShopItemCard.tsx` | 신규 카테고리 아이콘 매핑 (👕👖👟🎀🎨🎵✨) |
| 17 | `PurchaseModal.tsx` | 신규 카테고리 아이콘 매핑 |
| 18 | `InventoryItemCard.tsx` | 신규 카테고리 아이콘 및 한국어 라벨 |
| 19 | `.env` | JWT_SECRET, NEXT_PUBLIC_SITE_URL, NODE_ENV 추가 |
| 20 | `.env.example` | JWT_SECRET, 소켓 설정 문서화 |

---

## 4. 추가 파일 목록

| # | 파일 경로 | 목적 |
|---|----------|------|
| 1 | `apps/web/src/app/api/users/[userId]/minihome/visit/route.ts` (51줄) | 방문자 카운터 POST 엔드포인트. 본인 방문은 카운트 제외 |

---

## 5. DB 스키마 변경 요약

현재 apps/web은 인메모리 mock-db 사용 (PostgreSQL 미연결 상태).

| 변경 | 내용 |
|------|------|
| MockMinihome 추가 | id, userId, bio, skinId, bgmId, visitCount, createdAt |
| MockGemTransaction 추가 | id, userId, amount, type(earn/spend), reason, relatedItemId, createdAt |
| MockGuestbookEntry 추가 | id, minihomeUserId, authorId, authorNickname, authorAvatar, content, createdAt |
| MockShopItem 확장 | category에 top/bottom/shoes/accessory/skin/bgm/effect 추가 |
| MockInventoryItem 확장 | isActive, isEquipped 필드 추가 |
| MockUser 확장 | 신규 가입 시 gems 500 기본 |

---

## 6. API 추가/변경 목록

| 메서드 | 경로 | 상태 | 변경 내용 |
|--------|------|------|----------|
| GET | `/api/users/[userId]/minihome` | 변경 | 방명록, 스킨명, BGM명 포함 응답 |
| PUT | `/api/users/[userId]/minihome` | 추가 | 스킨/BGM/바이오 변경 (보유/만료 검증) |
| GET | `/api/users/[userId]/minihome/guestbook` | 변경 | 중앙 mock-db 사용 |
| POST | `/api/users/[userId]/minihome/guestbook` | 변경 | 필드명 message로 통일 |
| DELETE | `/api/users/[userId]/minihome/guestbook?entryId=` | 변경 | query param 방식 |
| POST | `/api/users/[userId]/minihome/visit` | 추가 | 방문 카운터 (본인 제외) |
| GET | `/api/shop/items` | 변경 | isActive 필드 포함 |
| POST | `/api/shop/purchase` | 변경 | 중복 구매 방지, 젬 트랜잭션, isEquipped 응답 |
| GET | `/api/inventory` | 변경 | isEquipped 필드 포함 |
| PUT | `/api/inventory` | 추가 | equip/unequip 액션 |

---

## 7. 시드 데이터 추가 목록

| 카테고리 | 수량 | 예시 |
|---------|------|------|
| top (상의) | 12 | 베이직 화이트 반팔, 스트라이프 긴팔, 후드 집업 등 |
| bottom (하의) | 8 | 데님 팬츠, 블랙 슬랙스, 카고 반바지 등 |
| shoes (신발) | 4 | 화이트 스니커즈, 블랙 하이탑 등 |
| accessory (악세서리) | 4 | 블랙 캡모자, 실버 목걸이 등 |
| skin (스킨) | 6 | 심플 그레이, 벚꽃 핑크, 오션 블루 등 |
| bgm (BGM) | 5 | 잔잔한 피아노, 신나는 일렉트로닉 등 |
| effect (이펙트) | 3 | 반짝이 파티클, 하트 이펙트 등 |
| broadcast (확성기) | 2 | 기본 확성기, 메가 확성기 |
| starter (스타터) | 1 | 웰컴 패키지 |
| **합계** | **45** | |

가격대: 30~800 젬, 신규 유저 기본 500젬으로 2~3개 구매 가능

---

## 8. 디버깅 시나리오 결과

| # | 시나리오 | 상태 | 비고 |
|---|---------|------|------|
| 1 | 회원가입 → 로그인 → 프로필 진입 | ✅ 수정 완료 | auth-store 토큰 클리어 조건 수정 |
| 2 | 새로고침 후 프로필 유지 | ✅ 수정 완료 | 500 에러 시 토큰 보존 |
| 3 | 하단바 미니홈피 클릭 → 내 미니홈피 | ✅ 수정 완료 | 동적 userId 경로 |
| 4 | 방명록 작성/삭제 | ✅ 코드 연결 완료 | API 경로 및 필드명 통일 |
| 5 | 스킨 변경 | ✅ 구현 완료 | 보유/만료 검증 포함 |
| 6 | BGM 변경 | ✅ 구현 완료 | 보유/만료 검증 포함 |
| 7 | 상점 → 구매 → 인벤토리 확인 | ✅ 연결 완료 | 중복 방지, 젬 차감 |
| 8 | 장착/해제 | ✅ 구현 완료 | PUT /api/inventory |
| 9 | 젬 부족 시 구매 버튼 비활성화 | ✅ 기존 구현 정상 | hasEnoughCurrency 로직 |
| 10 | 토큰 만료 후 인증 필요 API 호출 | ✅ 401 반환 | 기존 JWT 검증 정상 |
| 11 | 없는 userId로 미니홈피 접근 | ✅ 404 반환 | findUserById 검증 |
| 12 | 타인 미니홈피 수정 시도 | ✅ 403 반환 | userId 일치 검증 |
| 13 | 빈 방명록 메시지 제출 | ✅ 400 반환 | trim + length 검증 |
| 14 | 보유하지 않은 스킨 적용 시도 | ✅ 400 반환 | 인벤토리 소유 검증 |
| 15 | 만료된 아이템 적용 시도 | ✅ 400 반환 | expiresAt 검증 |

---

## 9. 아직 남은 리스크

| # | 리스크 | 심각도 | 설명 |
|---|--------|--------|------|
| 1 | 인메모리 DB | 높음 | 서버 재시작 시 모든 데이터 소실. PostgreSQL+Prisma 연결 필수 |
| 2 | 실시간 소켓 미연결 | 중간 | socket-server 존재하나 광장 실시간 채팅은 mock 상태 |
| 3 | 일촌(친구) 기본 플로우 | 중간 | API 존재하나 미니홈피 내 연동 미완 |
| 4 | 신고/차단 | 낮음 | API 존재, UI 존재, 실사용 테스트 미완 |
| 5 | 어드민 패널 | 낮음 | apps/admin 존재하나 최소 뷰 미검증 |
| 6 | 파일 업로드/아바타 이미지 | 중간 | S3 미연결, 이모지 기반 아바타만 동작 |
| 7 | 결제(토스페이먼츠) | 높음 | 환경변수만 준비, 실결제 미연결 |
| 8 | OAuth 소셜 로그인 | 낮음 | 환경변수만 준비 |
| 9 | 방명록 페이지네이션 | 낮음 | 현재 전체 로드, 대량 데이터 시 성능 문제 |
| 10 | 중복 방문 카운트 | 낮음 | 같은 유저가 반복 방문 시 계속 증가 |

---

## 10. 환경변수만 수정하면 배포 가능한지 여부

**부분적으로 가능.**

현재 상태에서 `.env`의 다음 값만 변경하면 인메모리 DB 기반으로 동작하는 데모 배포 가능:

- `JWT_SECRET` → 프로덕션용 시크릿
- `NEXT_PUBLIC_SITE_URL` → 실 도메인
- `NEXT_PUBLIC_SOCKET_URL` → 실 소켓 서버 주소
- `NODE_ENV=production`
- `APP_ENV=production`

단, 실서비스 배포를 위해서는:

- PostgreSQL 연결 필수 (mock-db → Prisma 전환)
- Redis 연결 필수 (세션/소켓)
- Nginx reverse proxy 설정 확인
- Docker 이미지 빌드 테스트 필요

---

## 11. 다음 작업 추천 5개

| 우선순위 | 작업 | 이유 |
|---------|------|------|
| P0 | mock-db → PostgreSQL+Prisma 전환 | 서버 재시작 시 데이터 소실 방지. 실서비스 필수 |
| P0 | socket-server 연결 및 광장 실시간 채팅 활성화 | 체류시간 핵심 기능 |
| P1 | 토스페이먼츠 결제 연동 (젬 충전) | 2주 내 유료 전환 목표 달성 |
| P1 | 일촌(친구) 플로우 미니홈피 연동 | 관계 형성 핵심 루프 |
| P2 | 아바타 이미지 시스템 (S3 업로드 또는 프리셋 이미지) | 꾸미기 욕구 강화 |

---

*보고서 작성 완료: 2026-03-09*
