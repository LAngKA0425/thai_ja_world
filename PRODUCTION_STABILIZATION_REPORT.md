# 태자월드 Production 안정화 작업 보고서

작업일: 2026-03-13

---

## 1. 수정 요약

| TODO | 상태 | 내용 |
|------|------|------|
| 1-2 | **수정** | `email-verification.ts` — `localhost:3000` 폴백 제거, `NEXT_PUBLIC_SITE_URL` 필수화 |
| 3 | 이미 적용 | `jwt.ts` — production에서 `JWT_SECRET` 없으면 `throw Error` (변경 불필요) |
| 4 | 이미 적용 | `jwt.ts` — `setExpirationTime('7d')` 이미 설정됨 (변경 불필요) |
| 5 | **수정** | `captcha.ts` + `signup/route.ts` — production에서 Turnstile 키 없으면 요청 거부 |
| 6 | 이미 적용 | `email-verification.ts` — SMTP 환경변수 존재 시 실제 발송 구조 유지 (변경 불필요) |
| 7 | 해당없음 | JWT Bearer token 구조 유지 (secure cookie 미사용) |
| 8 | **수정** | `LocalBusinessCard.tsx` — mapUrl에 `javascript:` 스킴 방어 (`/^https?:\/\//` 검증) |
| 9 | 이미 정상 | HomeBottomNav → `/tips` → TipsPage (현재 디자인 시스템 페이지) |
| 10 | 검증 완료 | 수정 파일 4개 구문 검증 통과 (brace/paren balance 정상) |

---

## 2. 수정 파일 목록

```
apps/web/src/lib/email-verification.ts
apps/web/src/lib/captcha.ts
apps/web/src/app/api/auth/signup/route.ts
apps/web/src/components/local/LocalBusinessCard.tsx
```

---

## 3. Unified Diff

### 3-1. apps/web/src/lib/email-verification.ts

```diff
@@ -102,10 +102,8 @@
   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
   if (!siteUrl) {
     console.error('[Email] NEXT_PUBLIC_SITE_URL 환경변수가 설정되지 않았습니다')
-    if (process.env.NODE_ENV === 'production') {
-      return { success: false, error: 'SITE_URL 설정이 필요합니다' }
-    }
+    return { success: false, error: 'SITE_URL 설정이 필요합니다' }
   }
-  const baseUrl = siteUrl || 'http://localhost:3000'
+  const baseUrl = siteUrl
   const verificationUrl = `${baseUrl}/verify-email?token=${token}`
```

### 3-2. apps/web/src/lib/captcha.ts

```diff
@@ -19,6 +19,10 @@
   // Dev mode: TURNSTILE_SECRET_KEY가 없으면 검증 스킵
   if (!secretKey || secretKey === '' || secretKey === 'dev-skip') {
+    if (process.env.NODE_ENV === 'production') {
+      console.error('[Turnstile] TURNSTILE_SECRET_KEY 환경변수가 설정되지 않았습니다')
+      return { success: false, error: 'CAPTCHA 설정이 필요합니다. 관리자에게 문의하세요.' }
+    }
     console.log('[Turnstile] Dev mode: verification skipped (no TURNSTILE_SECRET_KEY)')
     return { success: true }
   }
```

### 3-3. apps/web/src/app/api/auth/signup/route.ts

```diff
@@ -31,6 +31,16 @@
     }

+    // Production: Turnstile 환경변수 필수 체크
+    if (process.env.NODE_ENV === 'production') {
+      if (!process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
+        console.error('[Signup] Turnstile 환경변수가 설정되지 않았습니다')
+        return NextResponse.json(
+          { message: 'CAPTCHA 설정이 필요합니다. 관리자에게 문의하세요.' },
+          { status: 500 }
+        )
+      }
+    }
+
     // Turnstile CAPTCHA verification
     const captchaResult = await verifyTurnstileToken(turnstileToken || '', ip)
```

### 3-4. apps/web/src/components/local/LocalBusinessCard.tsx

```diff
@@ -113,7 +113,7 @@
-          {business.mapUrl && (
+          {business.mapUrl && /^https?:\/\//.test(business.mapUrl) && (
             <a
               href={business.mapUrl}
               target="_blank"
               rel="noopener noreferrer"
```

---

## 4. Production 환경변수 목록

서버 실행 전 반드시 설정해야 하는 환경변수:

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NODE_ENV` | **필수** | `production` |
| `NEXT_PUBLIC_SITE_URL` | **필수** | 실제 도메인 URL (예: `https://taejawold.com`) |
| `JWT_SECRET` | **필수** | 랜덤 시크릿 (없으면 서버 시작 불가) |
| `TURNSTILE_SECRET_KEY` | **필수** | Cloudflare Turnstile 서버 시크릿 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **필수** | Cloudflare Turnstile 사이트 키 |
| `SMTP_HOST` | **필수** | SMTP 서버 주소 |
| `SMTP_PORT` | 선택 | SMTP 포트 (기본값: 587) |
| `SMTP_USER` | **필수** | SMTP 인증 사용자 |
| `SMTP_PASS` | **필수** | SMTP 인증 비밀번호 |
| `SMTP_FROM` | 선택 | 발신자 (기본값: `"태국에 살자" <noreply@taeja.world>`) |
| `NEXT_PUBLIC_SOCKET_URL` | 권장 | 소켓 서버 URL |

---

## 5. 도메인 연결 후 테스트 체크리스트

- [ ] `/` — 홈 페이지 정상 렌더링
- [ ] `/community` — 커뮤니티 페이지 정상
- [ ] `/local` — 로컬추천 페이지 정상, 지도 링크 `https://` 스킴만 동작
- [ ] `/tips` — 제보 페이지 정상 (하단 네비 제보 버튼 → 현재 디자인)
- [ ] `/my` — 마이 페이지 정상
- [ ] `/minihome/{userId}` — 미니홈피 정상
- [ ] `/verify-email?token=xxx` — 이메일 인증 페이지 정상
- [ ] 회원가입 → 이메일 인증 메일 수신 확인 (링크가 실제 도메인 기반)
- [ ] 회원가입 시 Turnstile CAPTCHA 위젯 정상 표시
- [ ] JWT 토큰 발급 후 7일 만료 확인
- [ ] `NEXT_PUBLIC_SITE_URL` 미설정 시 이메일 발송 실패 (localhost 링크 생성 불가)
- [ ] `JWT_SECRET` 미설정 시 서버 시작 불가 확인
- [ ] `TURNSTILE_SECRET_KEY` 미설정 시 signup API 500 에러 반환 확인
- [ ] 외부 링크 (LINE, 지도) → 새 탭 오픈 + `rel="noopener noreferrer"` 확인
