# 회원가입 보안 강화 구현 결과

## 1. 구현 방식 요약

휴대폰 인증 없이 **이메일 인증 + Cloudflare Turnstile + Rate Limit + Honeypot** 조합으로 초기 출시용 저비용 회원가입 보안을 구현했습니다.

- **이메일 인증**: 토큰 기반 (SHA-256 해시 저장, 24시간 만료, 1회용)
- **봇 방어**: Cloudflare Turnstile (서버 검증 포함) + Honeypot hidden field
- **Rate Limit**: In-memory sliding window (가입 5/분, 로그인 10/분, 재전송 3/분)
- **권한 제한**: emailVerified=false인 계정은 JWT 발급 안 함 → 주요 기능 접근 불가
- **Dev mode**: SMTP/Turnstile 미설정 시 콘솔 출력 + CAPTCHA 스킵으로 개발 편의 보장

## 2. 이메일 인증 플로우

```
[회원가입]
  ↓
POST /api/auth/signup
  → Turnstile 서버 검증
  → Honeypot 체크
  → Rate limit 체크
  → 유저 생성 (emailVerified: false)
  → 인증 토큰 생성 (crypto.randomBytes 32bytes)
  → 토큰 SHA-256 해시로 저장
  → 인증 메일 발송 (dev: 콘솔 출력)
  → 응답: { requiresVerification: true } (JWT 미발급)
  ↓
[이메일 인증 대기 화면] /verify-email?email=xxx
  → 재전송 버튼 (60초 쿨다운)
  ↓
[사용자가 메일 링크 클릭]
  ↓
GET /api/auth/verify-email?token=xxx
  → Rate limit 체크
  → 토큰 해시 비교
  → 만료 확인
  → emailVerified = true 갱신
  → 사용된 토큰 삭제
  ↓
[인증 완료 화면] → 로그인 페이지 이동
  ↓
POST /api/auth/login
  → Rate limit 체크
  → emailVerified 확인
  → emailVerified=false → 403 + requiresVerification
  → emailVerified=true → JWT 발급 + 로그인
```

## 3. CAPTCHA/Turnstile 적용 방식

- **프론트엔드**: `TurnstileWidget` 컴포넌트 (가입 폼에 삽입)
  - Turnstile JS SDK 동적 로드
  - 검증 성공 시 토큰을 state에 저장
  - Dev mode (NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정): 자동 통과 + 안내 표시
- **서버**: `/api/auth/signup`에서 Cloudflare siteverify API 호출
  - TURNSTILE_SECRET_KEY 미설정 시 검증 스킵 (dev mode)
- **추가 방어**: Honeypot hidden field (봇이 채우면 silent reject)

## 4. Rate Limit 적용 위치

| 엔드포인트 | 제한 | 키 |
|---|---|---|
| POST /api/auth/signup | 5 req / 60s | IP |
| POST /api/auth/login | 10 req / 60s | IP |
| POST /api/auth/resend-verification | 3 req / 60s | IP |
| GET /api/auth/verify-email | 10 req / 60s | IP |
| 이메일 재전송 쿨다운 | 60초 / 이메일 | email |

## 5. 수정 파일 목록

### 신규 생성 (7개)
| 파일 | 설명 |
|---|---|
| `apps/web/src/lib/rate-limit.ts` | In-memory sliding window rate limiter |
| `apps/web/src/lib/captcha.ts` | Cloudflare Turnstile 서버 검증 |
| `apps/web/src/lib/email-verification.ts` | 토큰 생성/검증/발송/쿨다운 |
| `apps/web/src/components/auth/TurnstileWidget.tsx` | Turnstile 프론트엔드 컴포넌트 |
| `apps/web/src/app/api/auth/verify-email/route.ts` | 이메일 인증 확인 API |
| `apps/web/src/app/api/auth/resend-verification/route.ts` | 인증 메일 재전송 API |
| `apps/web/src/app/(auth)/verify-email/page.tsx` | 인증 대기/확인 페이지 |

### 수정 (8개)
| 파일 | 변경 내용 |
|---|---|
| `apps/web/src/lib/mock-db.ts` | MockUser에 `emailVerified` 필드 추가 |
| `apps/web/src/app/api/auth/signup/route.ts` | Turnstile 검증, honeypot, rate limit, 이메일 인증 토큰 발송, JWT 미발급 |
| `apps/web/src/app/api/auth/login/route.ts` | rate limit, emailVerified 미인증 시 403 |
| `apps/web/src/app/api/auth/me/route.ts` | emailVerified=false 시 403 |
| `apps/web/src/app/(auth)/signup/page.tsx` | TurnstileWidget 추가, 가입 후 verify-email 리다이렉트 |
| `apps/web/src/app/(auth)/login/page.tsx` | 미인증 에러 시 재전송 링크 표시 |
| `apps/web/src/stores/auth-store.ts` | signup 반환값에 requiresVerification 처리, login에 requiresVerification 에러 처리 |
| `.env.example` | TURNSTILE 키, SMTP 환경변수 추가 |

## 6. 필요한 환경변수

### 신규 추가
```env
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   # 프론트엔드 사이트 키 (비워두면 dev mode)
TURNSTILE_SECRET_KEY=             # 서버 시크릿 키 (비워두면 dev mode)

# SMTP (이메일 발송)
SMTP_HOST=                        # 비워두면 콘솔 출력 (dev mode)
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@taeja.world
```

### 기존 (변경 없음)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # 인증 링크 기본 URL
JWT_SECRET=dev-secret-key-change-in-production
```

## 7. 수동 테스트 절차

### Dev 환경 준비
SMTP_HOST, TURNSTILE 키를 비워둔 채로 `pnpm dev` 실행.
인증 메일은 **서버 콘솔**에 출력됩니다.

### 7-1. 정상 가입
1. `/signup` 접속
2. 이메일, 닉네임, 비밀번호 입력, 이용약관 동의
3. [Dev] CAPTCHA 자동 통과 확인
4. "가입하기" 클릭
5. `/verify-email?email=xxx` 리다이렉트 확인
6. 서버 콘솔에서 Verification URL 복사
7. 브라우저에 URL 붙여넣기
8. "이메일 인증이 완료되었습니다" 메시지 확인
9. "로그인하러 가기" 클릭 → 로그인 성공

### 7-2. 중복 이메일
1. 이미 가입된 이메일로 가입 시도
2. "이미 가입된 이메일입니다" 에러 확인

### 7-3. 인증 전 로그인 시도
1. 가입 후 이메일 인증하지 않고 `/login`에서 로그인 시도
2. "이메일 인증이 필요합니다" 메시지 + "인증 메일 재전송" 링크 확인
3. 링크 클릭 시 `/verify-email?email=xxx` 이동

### 7-4. 인증 완료 후 로그인
1. 이메일 인증 완료 후 `/login`에서 로그인
2. JWT 발급 + `/plaza` 리다이렉트 확인

### 7-5. 만료 토큰
1. `email-verification.ts`의 `TOKEN_EXPIRY_MS`를 테스트용으로 10초로 변경
2. 가입 → 10초 대기 → 인증 링크 클릭
3. "인증 토큰이 만료되었습니다" 에러 확인

### 7-6. 재전송
1. `/verify-email?email=xxx`에서 "인증 메일 재전송" 클릭
2. "인증 메일을 전송했습니다" 메시지 확인
3. 즉시 다시 클릭 → "XX초 후에 다시 시도해주세요" 쿨다운 확인

### 7-7. CAPTCHA 실패 (Production)
1. `TURNSTILE_SECRET_KEY` 설정 후 turnstileToken 없이 가입 요청
2. "CAPTCHA 인증이 필요합니다" 에러 확인

### 7-8. Rate Limit 초과
1. 같은 IP에서 6번 연속 가입 시도
2. "너무 많은 가입 시도입니다" (429) 확인

## 8. Dev/Test 환경에서 이메일 인증 확인 방법

| 방법 | 설명 |
|---|---|
| **서버 콘솔** | SMTP_HOST 미설정 시 인증 URL이 콘솔에 출력됨 |
| **직접 URL** | 콘솔에서 `/verify-email?token=xxx` 복사 후 브라우저 접속 |
| **토큰 직접 사용** | 콘솔에 출력된 Token 값을 `/api/auth/verify-email?token=xxx`로 GET 요청 |

## 9. 추후 확장 포인트

- `email-verification.ts`의 in-memory store → Redis/DB 교체
- `rate-limit.ts`의 in-memory store → Redis 교체 (백엔드에 이미 Redis rate limit 있음)
- `sendVerificationEmail()`에 nodemailer/Resend/SendGrid/SES 연동
- 신규 계정 24시간 링크 제한: `User.createdAt` 기준으로 middleware에서 체크
- Turnstile → 로그인 폼에도 추가 가능 (현재는 가입만)
- 백엔드 FastAPI `anti_abuse.py`의 스텁에 실제 Turnstile 검증 연동
