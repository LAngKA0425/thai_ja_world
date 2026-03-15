# 태자월드 운영 점검 보고서

점검일: 2026-03-12

---

## 1. 운영 가능 판정

### 판정: 아직 런칭 불가 (비공개 베타도 위험)

---

## 2. 판정 이유

### 핵심 문제: Next.js 프론트엔드(apps/web)가 mock-db(순수 인메모리)에 의존

현재 apps/web의 모든 auth API 라우트(signup, login, me, verify-email, resend)가
`@/lib/mock-db`를 import하여 사용합니다. 이 mock-db는:

- 순수 JavaScript 배열(in-memory)로 데이터를 저장
- 서버 프로세스 재시작 시 모든 데이터 소실
- 파일시스템/DB/Redis 어디에도 persist하지 않음
- 가입한 사용자, 이메일 인증 상태, 인증 토큰이 전부 날아감

이는 이메일 인증 패치의 보안 설계가 아무리 견고해도
실제 운영에서는 "가입 → 서버 재시작 → 인증 불가 → 로그인 불가"가 됩니다.

추가로, 이메일 인증 토큰 저장소(email-verification.ts)와
Rate Limit 저장소(rate-limit.ts)도 동일하게 인메모리입니다.

### 백엔드(FastAPI)는 PostgreSQL + Redis 기반으로 실제 운영 가능한 구조이나, 프론트엔드 API 라우트가 백엔드 대신 mock-db를 직접 사용하고 있어 연결이 끊어져 있습니다.

---

## 3. Auth/Email Verification 위험 요소 목록

| 번호 | 위험 요소 | 심각도 | 상태 |
|------|-----------|--------|------|
| 1 | mock-db 인메모리: 유저 데이터 재시작 시 전부 소실 | BLOCKER | 미해결 |
| 2 | 인증 토큰 인메모리: 재시작 시 미인증 유저 영구 잠김 | BLOCKER | 미해결 |
| 3 | Rate Limit 인메모리: 재시작으로 제한 우회 가능 | HIGH | 미해결 |
| 4 | SMTP 미설정: dev mode 콘솔 출력만 동작 | BLOCKER | 설정 필요 |
| 5 | Turnstile 키 미설정: dev mode에서 CAPTCHA 자동 통과 | HIGH | 설정 필요 |
| 6 | JWT_SECRET 기본값: 'dev-secret-key-change-in-production' | BLOCKER | 변경 필요 |
| 7 | NEXT_PUBLIC_SITE_URL 기본값: localhost:3000 | HIGH | 도메인 변경 필요 |
| 8 | 비밀번호 재설정 기능 없음 | MEDIUM | 미구현 |
| 9 | 프론트 API 라우트가 백엔드 FastAPI를 사용하지 않음 | HIGH | 연결 필요 |

### 보안 설계 자체는 우수

아래 항목들은 올바르게 구현되어 있습니다:

- 인증 전 JWT 미발급 (signup에서 토큰 반환 안 함)
- 인증 전 로그인 차단 (/login에서 403)
- 인증 전 /me 접근 차단 (403)
- 토큰 SHA-256 해시 저장 (평문 아님)
- 토큰 24시간 만료 + 1회용
- Rate limit 4개 엔드포인트 적용
- Turnstile 서버 검증 (프론트 only 아님)
- Honeypot hidden field
- 이메일 존재 여부 미노출 (resend에서 동일 응답)
- 재전송 60초 쿨다운 (IP + 이메일 이중)
- bcrypt 비밀번호 해싱

---

## 4. 관리자 기능 구현 범위 표

### 4-1. 회원 관리

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 회원 목록 조회/검색 | O (GET /admin/users) | O (app/frontend + apps/admin) | 구현됨 |
| 이메일/닉네임/전화번호 검색 | O | O | 구현됨 |
| 역할(role) 변경 | O (PATCH /admin/users/{id}) | O | 구현됨 |
| 상태(status) 변경 | O | O | 구현됨 |
| 중복 전화번호 계정 확인 | O (GET /admin/users/{id}/duplicates) | O (필터 있음) | 구현됨 |
| 중복 이메일 확인 | X (User.email은 unique이므로 DB 레벨 차단) | X | 이메일은 unique 제약으로 충분 |
| 의심 계정 (suspicious_signup) | O (필드 존재 + 필터) | O (admin에서 확인) | 구현됨 |
| admin_note 메모 | O | O | 구현됨 |
| 이메일/폰 인증 수동 변경 | O (PATCH) | O | 구현됨 |
| 가입 위험도 점수 확인 | O | O | 구현됨 |
| 마지막 로그인 IP/시간 | O (모델에 필드 존재) | 부분 (상세에서 확인) | 구현됨 |

### 4-2. 차단/경고 관리

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 유저 차단(ban) | O (POST /moderation/ban) | O | 구현됨 |
| 차단 사유 기록 | O (banned_reason) | O | 구현됨 |
| 기간 지정 차단 | O (banned_until) | O | 구현됨 |
| 차단 해제 | O | O | 구현됨 |
| 일시 차단 (blocked_until) | O (모델 필드) | 부분 | 구현됨 |
| 경고 누적 시스템 | X | X | 미구현 (별도 warning count 없음) |

### 4-3. 신고 관리

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 신고 접수 (사건/사기/팁) | O (POST /admin/reports) | O (공개 report 페이지) | 구현됨 |
| 신고 목록 조회 | O (GET /admin/reports/list) | O | 구현됨 |
| 콘텐츠 신고 (게시글/댓글/유저) | O (POST /moderation/reports) | O | 구현됨 |
| 콘텐츠 숨김 처리 | O (POST /moderation/hide) | O | 구현됨 |
| 신고 상태 관리 (new/triaged/closed) | O | O | 구현됨 |
| 인증 여부 기준 필터링 | 부분 (email_verified 필드 존재) | X (UI 필터 없음) | 부분 구현 |

### 4-4. 로컬추천(업체) 관리

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 로컬 가게 사진 수정 | X | X | 미구현 |
| 로컬 가게 설명 수정 | X | X | 미구현 |
| 로컬 가게 가격 수정 | X | X | 미구현 |
| 로컬 가게 배지 수정 | X | X | 미구현 |
| 로컬추천 노출 on/off | X | X | 미구현 |
| 로컬추천 목록 관리 | X | X | 미구현 |

### 4-5. 콘텐츠/게시판 관리

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 금지 키워드 관리 | O (GET/POST/DELETE /moderation/keywords) | O | 구현됨 |
| 게시글 숨김/복원 | O | O | 구현됨 |
| 콘텐츠 일정 발행 | O (scheduled posts) | O | 구현됨 |
| 콘텐츠 소스 수집 (ingestion) | O | O | 구현됨 |
| 공지사항 관리 | 부분 (apps/admin에 있으나 mock 데이터) | 부분 | 스텁 |
| 확성기(broadcast) 관리 | 부분 (apps/admin에 있으나 mock 데이터) | 부분 | 스텁 |

### 4-6. 감사/모니터링

| 기능 | API | UI | 상태 |
|------|-----|-----|------|
| 관리자 행동 감사 로그 | O (GET /admin/audit-logs) | O | 구현됨 |
| 관리자 알림 시스템 | O (GET /admin/notifications) | O | 구현됨 |
| 대시보드 통계 | O (GET /admin/dashboard) | O | 구현됨 |

---

## 5. 운영 전 반드시 수정할 항목

### BLOCKER (이것 없이는 서비스 시작 불가)

| 번호 | 항목 | 설명 |
|------|------|------|
| B1 | mock-db → 실제 DB 연결 | apps/web의 API 라우트가 PostgreSQL(Prisma 또는 FastAPI 백엔드)을 사용하도록 교체 |
| B2 | 이메일 인증 토큰 persistent 저장 | email-verification.ts의 인메모리 배열 → Redis 또는 DB 테이블 |
| B3 | SMTP/이메일 서비스 설정 | Resend, SendGrid, AWS SES 등 실제 이메일 발송 연동 |
| B4 | JWT_SECRET 변경 | 운영용 강력한 랜덤 값으로 교체 |
| B5 | NEXT_PUBLIC_SITE_URL 설정 | 실제 도메인 (https://taeja.world 등)으로 변경 |
| B6 | Turnstile 키 설정 | Cloudflare 대시보드에서 사이트키/시크릿키 발급 후 .env 설정 |

### HIGH (베타 운영이라도 반드시 필요)

| 번호 | 항목 | 설명 |
|------|------|------|
| H1 | Rate Limit → Redis | 인메모리 rate limit를 Redis 기반으로 교체 (백엔드에 이미 있음) |
| H2 | 비밀번호 재설정 기능 | 이메일 기반 비밀번호 리셋 플로우 |
| H3 | 프론트 API → 백엔드 API 연결 | apps/web이 mock-db 대신 FastAPI 백엔드를 호출하도록 전환 |
| H4 | 인증 여부 필터 (관리자) | 관리자 UI에서 email_verified 기준 필터링 추가 |

---

## 6. 나중으로 미뤄도 되는 항목

| 번호 | 항목 | 이유 |
|------|------|------|
| L1 | 로컬추천 관리자 기능 | 로컬추천 기능 자체가 아직 초기 단계 |
| L2 | 경고 누적 시스템 | 차단(ban)으로 충분, 경고 누적은 유저 수 증가 후 |
| L3 | OAuth (Google/Kakao) 로그인 | 이메일 인증으로 초기 충분 |
| L4 | 2FA | 이메일 인증으로 초기 충분 |
| L5 | 공지사항/확성기 관리 실DB 연동 | 현재 스텁 상태, 콘텐츠 우선순위 낮음 |
| L6 | 포인트/젬 관리자 수동 조정 | 초기에 직접 DB 쿼리로 가능 |
| L7 | 디바이스 핑거프린팅 | 초기 봇 방어로 Turnstile + rate limit 충분 |

---

## 7. 수정 파일 범위 제안

### 가장 현실적인 경로: apps/web API 라우트를 FastAPI 백엔드 호출로 전환

현재 구조:
```
사용자 → Next.js API Route → mock-db (인메모리)
```

목표 구조:
```
사용자 → Next.js API Route → FastAPI 백엔드 → PostgreSQL + Redis
```

수정이 필요한 파일:

| 파일 | 수정 내용 |
|------|-----------|
| apps/web/src/app/api/auth/signup/route.ts | mock-db 대신 FastAPI POST /api/v1/auth/register 호출 |
| apps/web/src/app/api/auth/login/route.ts | mock-db 대신 FastAPI POST /api/v1/auth/login 호출 |
| apps/web/src/app/api/auth/me/route.ts | mock-db 대신 FastAPI GET /api/v1/auth/me 호출 |
| apps/web/src/app/api/auth/verify-email/route.ts | 인메모리 토큰 → FastAPI 인증 엔드포인트 또는 Redis |
| apps/web/src/app/api/auth/resend-verification/route.ts | 동일 |
| apps/web/src/lib/email-verification.ts | 인메모리 → Redis/DB 연동 |
| apps/web/src/lib/rate-limit.ts | 인메모리 → Redis 연동 |
| app/backend/src/core/api/v1/auth.py | 이메일 인증 플로우 추가 (현재 스텁) |

또는, Next.js API 라우트를 제거하고 프론트엔드에서 직접 FastAPI를 호출하는 방식도 가능합니다.
이 경우 auth-store.ts의 fetch URL만 변경하면 됩니다.

---

## 요약

보안 설계(인증 토큰 해시, 1회용, 만료, rate limit, Turnstile 서버검증, JWT 미발급 등)는
**운영 수준으로 견고하게 구현**되어 있습니다.

문제는 단 하나: **데이터가 영속되지 않습니다.**

mock-db를 실제 DB로 교체하고, SMTP와 Turnstile 키를 설정하면
비공개 베타 → 공개 런칭까지 갈 수 있는 구조입니다.

관리자 기능은 회원 관리/신고/차단/콘텐츠 관리가 백엔드 API + UI 모두 구현되어 있어
운영에 필요한 기본 도구는 갖추고 있습니다.
로컬추천 관리만 미구현이며 이는 기능 자체의 우선순위에 따라 추후 구현하면 됩니다.
