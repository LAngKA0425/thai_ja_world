# 태자월드 환경변수 전체 문서

## 개요

이 문서는 태자월드 프로젝트에서 사용하는 모든 환경변수를 설명합니다. 각 변수의 용도, 필수 여부, 기본값을 제시하며, 개발/프로덕션 환경별 차이를 명시합니다.

---

## 1. 데이터베이스 설정

### DATABASE_URL

**용도:** Prisma ORM이 PostgreSQL 데이터베이스에 접속하기 위한 연결 문자열

**필수여부:** 필수 (개발/프로덕션)

**형식:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**개발 환경 예시:**
```env
DATABASE_URL="postgresql://taeja:changeme@localhost:5432/taeja_world?schema=public"
```

**프로덕션 환경 예시:**
```env
DATABASE_URL="postgresql://taeja:secure-password@db.production.com:5432/taeja_world_prod?schema=public&sslmode=require"
```

**주의사항:**
- 프로덕션: SSL 연결 필수 (`sslmode=require`)
- 프로덕션: 강력한 비밀번호 필수
- 데이터베이스 이름은 환경마다 다르게 설정 권장
- RDS, Cloud SQL 등 관리형 DB 사용 시 제공되는 URL 사용

---

## 2. 인증 관련

### JWT_SECRET

**용도:** JWT 토큰 서명 및 검증을 위한 비밀 키

**필수여부:** 필수 (개발/프로덕션)

**길이:** 최소 32자 이상 (암호학적으로 안전한 랜덤 문자열)

**생성 방법:**
```bash
# 안전한 시크릿 생성
openssl rand -base64 32

# 또는
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**개발 환경 예시:**
```env
JWT_SECRET="qYVKrfGzQ2j9K+7J3mLqP8sWxYzA1bC2dEfGhIjKlMnOpQrStUvWxYzAbCdEfGh"
```

**프로덕션 환경 예시:**
```env
JWT_SECRET="<서버 관리자가 생성한 보안 시크릿>"
```

**관련 서비스:**
- `apps/web` - 사용자 로그인 토큰
- `apps/socket-server` - 실시간 통신 인증

---

### JWT_EXPIRES_IN

**용도:** JWT 토큰의 유효 기간

**필수여부:** 선택 (기본값: "7d")

**형식:** 숫자 + 단위 (s/m/h/d/w)
- `s` - 초
- `m` - 분
- `h` - 시간
- `d` - 일
- `w` - 주

**개발 환경:**
```env
JWT_EXPIRES_IN="7d"
```

**프로덕션 환경 (보안 강화):**
```env
JWT_EXPIRES_IN="24h"  # 또는 더 짧게 설정
```

---

### NEXTAUTH_URL

**용도:** NextAuth.js 콜백 URL 및 세션 쿠키 설정

**필수여부:** 필수 (개발/프로덕션)

**개발 환경:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

**프로덕션 환경:**
```env
NEXTAUTH_URL="https://taeja.world"
```

**주의사항:**
- 프로덕션: HTTPS 필수
- OAuth 콜백 URL 리다이렉션에 사용
- 도메인 변경 시 반드시 수정

---

### NEXTAUTH_SECRET

**용도:** NextAuth.js 세션 암호화 및 CSRF 토큰 서명

**필수여부:** 필수 (개발/프로덕션)

**길이:** 최소 32자

**생성 방법:**
```bash
openssl rand -base64 32
```

**개발 환경:**
```env
NEXTAUTH_SECRET="devSecretKeyForLocalTesting1234567890abcdef"
```

**프로덕션 환경:**
```env
NEXTAUTH_SECRET="<별도 생성된 보안 키>"
```

---

## 3. 서비스 URL (공개 환경변수)

**주의:** `NEXT_PUBLIC_`으로 시작하는 환경변수는 클라이언트에 노출됩니다. 민감한 정보를 포함하지 마세요.

### NEXT_PUBLIC_WEB_URL

**용도:** 웹 앱의 기본 URL (SEO, 이메일 링크 등에서 사용)

**필수여부:** 필수 (개발/프로덕션)

**개발 환경:**
```env
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
```

**프로덕션 환경:**
```env
NEXT_PUBLIC_WEB_URL="https://taeja.world"
```

---

### NEXT_PUBLIC_SOCKET_URL

**용도:** Socket.io 서버 연결 주소

**필수여부:** 필수 (개발/프로덕션)

**개발 환경:**
```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

**프로덕션 환경:**
```env
NEXT_PUBLIC_SOCKET_URL="https://socket.taeja.world"
# 또는
NEXT_PUBLIC_SOCKET_URL="https://taeja.world/socket"  # 프록시 사용 시
```

**주의사항:**
- 프로덕션: wss:// (Secure WebSocket) 필수
- CORS 설정이 `SOCKET_CORS_ORIGIN`과 일치해야 함

---

### NEXT_PUBLIC_ADMIN_URL

**용도:** 관리자 대시보드 URL

**필수여부:** 필수 (개발/프로덕션)

**개발 환경:**
```env
NEXT_PUBLIC_ADMIN_URL="http://localhost:3002"
```

**프로덕션 환경:**
```env
NEXT_PUBLIC_ADMIN_URL="https://admin.taeja.world"
# 또는
NEXT_PUBLIC_ADMIN_URL="https://taeja.world/admin"
```

---

### NEXT_PUBLIC_API_URL

**용도:** API 엔드포인트 기본 URL

**필수여부:** 필수 (개발/프로덕션)

**개발 환경:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**프로덕션 환경:**
```env
NEXT_PUBLIC_API_URL="https://taeja.world/api"
```

**사용 위치:**
- 클라이언트 API 요청 (fetch, axios 등)
- 인터널 링크 생성

---

## 4. Socket.io 서버 설정

### SOCKET_PORT

**용도:** Socket.io 서버 포트

**필수여부:** 선택 (기본값: 3001)

**개발 환경:**
```env
SOCKET_PORT=3001
```

**프로덕션 환경:**
```env
SOCKET_PORT=3001  # 보통 리버스 프록시 뒤에서 운영
```

---

### SOCKET_CORS_ORIGIN

**용도:** Socket.io CORS 요청 허용 오리진

**필수여부:** 필수 (개발/프로덕션)

**개발 환경 (단일 오리진):**
```env
SOCKET_CORS_ORIGIN="http://localhost:3000"
```

**프로덕션 환경 (다중 오리진):**
```env
SOCKET_CORS_ORIGIN="https://taeja.world,https://admin.taeja.world"
```

**또는 배열 형식 (JSON):**
```env
SOCKET_CORS_ORIGIN="https://taeja.world|https://admin.taeja.world"
```

---

## 5. 관리자 설정

### ADMIN_EMAIL

**용도:** 초기 관리자 계정 이메일

**필수여부:** 선택 (권장)

**개발 환경:**
```env
ADMIN_EMAIL="admin@taeja.world"
```

**프로덕션 환경:**
```env
ADMIN_EMAIL="admin@company.com"
```

---

### ADMIN_DEFAULT_PASSWORD

**용도:** 초기 관리자 계정 비밀번호 (개발용만)

**필수여부:** 선택 (개발 환경에서만 권장)

**주의사항:**
- 프로덕션: 환경변수에 설정하지 말 것
- 초기 설정 후 수동으로 비밀번호 변경 필수
- 강력한 비밀번호 권장

**개발 환경:**
```env
ADMIN_DEFAULT_PASSWORD="admin123"
```

---

## 6. OAuth 인증 (소셜 로그인)

### Google OAuth

**필수여부:** 선택 (기능 구현 시 필수)

**GOOGLE_CLIENT_ID**
```env
GOOGLE_CLIENT_ID="<Google Cloud Console에서 발급>"
```

**GOOGLE_CLIENT_SECRET**
```env
GOOGLE_CLIENT_SECRET="<Google Cloud Console에서 발급>"
```

**설정 방법:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. "OAuth 동의 화면" 구성
3. "사용자 인증 정보" → "OAuth 2.0 클라이언트 ID" 생성
4. 리다이렉션 URI 설정:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://taeja.world/api/auth/callback/google`

---

### Kakao OAuth

**필수여부:** 선택 (기능 구현 시 필수)

**KAKAO_CLIENT_ID**
```env
KAKAO_CLIENT_ID="<Kakao Developers에서 발급>"
```

**KAKAO_CLIENT_SECRET**
```env
KAKAO_CLIENT_SECRET="<Kakao Developers에서 발급>"
```

**설정 방법:**
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 애플리케이션 등록
3. "REST API 키" 확인
4. 보안 섹션에서 "보안 키" 생성
5. "플랫폼" → "Web"에서 Redirect URI 등록:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://taeja.world`

---

## 7. 결제 게이트웨이

### Toss Payments

**필수여부:** 선택 (결제 기능 구현 시 필수)

**TOSS_PAYMENTS_CLIENT_KEY**
```env
TOSS_PAYMENTS_CLIENT_KEY="<Toss Payments 개발자 센터에서 발급>"
```

**TOSS_PAYMENTS_SECRET_KEY**
```env
TOSS_PAYMENTS_SECRET_KEY="<Toss Payments 개발자 센터에서 발급>"
```

**TOSS_PAYMENTS_WEBHOOK_SECRET**
```env
TOSS_PAYMENTS_WEBHOOK_SECRET="<Webhook 설정 시 발급>"
```

**설정 방법:**
1. [Toss Payments](https://developers.tosspayments.com/) 개발자 센터 가입
2. API 키 페이지에서 클라이언트/시크릿 키 확인
3. Webhook 설정:
   - 개발: `http://localhost:3000/api/payments/webhook`
   - 프로덕션: `https://taeja.world/api/payments/webhook`

---

## 8. 파일 스토리지

### AWS S3

**필수여부:** 선택 (파일 업로드 기능 시 필수)

**S3_BUCKET**
```env
S3_BUCKET="taeja-world-bucket"
```

**S3_REGION**
```env
S3_REGION="ap-northeast-2"  # 서울 리전
```

**S3_ACCESS_KEY**
```env
S3_ACCESS_KEY="<AWS IAM 액세스 키>"
```

**S3_SECRET_KEY**
```env
S3_SECRET_KEY="<AWS IAM 비밀 액세스 키>"
```

**설정 방법:**
1. AWS S3 버킷 생성
2. IAM 사용자 생성 및 S3 정책 연결
3. 액세스 키 생성

---

### Cloudflare R2 (S3 호환)

**필수여부:** 선택 (파일 업로드 기능 시, S3 대안)

**R2_ACCOUNT_ID**
```env
R2_ACCOUNT_ID="<Cloudflare 계정 ID>"
```

**R2_ACCESS_KEY**
```env
R2_ACCESS_KEY="<R2 API 토큰>"
```

**R2_SECRET_KEY**
```env
R2_SECRET_KEY="<R2 API 비밀>"
```

**R2_BUCKET**
```env
R2_BUCKET="taeja-world"
```

**R2_ENDPOINT** (선택)
```env
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
```

**장점:**
- AWS S3보다 저렴
- S3 API와 호환
- 무제한 이전량

---

## 9. 이메일/알림 서비스

### SMTP (일반 메일 서버)

**필수여부:** 선택 (이메일 발송 기능 시)

**SMTP_HOST**
```env
SMTP_HOST="smtp.gmail.com"
# 또는
SMTP_HOST="smtp.company.com"
```

**SMTP_PORT**
```env
SMTP_PORT=587  # TLS
# 또는
SMTP_PORT=465  # SSL
```

**SMTP_USER**
```env
SMTP_USER="noreply@taeja.world"
```

**SMTP_PASS**
```env
SMTP_PASS="<메일 서버 비밀번호 또는 앱 비밀번호>"
```

**SMTP_FROM_EMAIL** (선택)
```env
SMTP_FROM_EMAIL="noreply@taeja.world"
```

---

### SendGrid

**필수여부:** 선택 (이메일 발송 기능 시, SMTP 대안)

**SENDGRID_API_KEY**
```env
SENDGRID_API_KEY="<SendGrid API 키>"
```

**SENDGRID_FROM_EMAIL**
```env
SENDGRID_FROM_EMAIL="noreply@taeja.world"
```

**설정 방법:**
1. [SendGrid](https://sendgrid.com/) 가입
2. API 키 생성
3. Sender Identity 등록

---

## 10. CDN (콘텐츠 전송 네트워크)

### NEXT_PUBLIC_CDN_URL

**용도:** 정적 자산(이미지, CSS 등) 제공 URL

**필수여부:** 선택 (성능 최적화)

**개발 환경 (생략 시 기본값 사용):**
```env
# 설정하지 않으면 localhost 사용
```

**프로덕션 환경:**
```env
NEXT_PUBLIC_CDN_URL="https://cdn.taeja.world"
# 또는 Cloudflare CDN
NEXT_PUBLIC_CDN_URL="https://taeja.world.cdn.cloudflare.net"
```

---

## 11. 환경 및 디버그

### NODE_ENV

**용도:** Node.js 실행 환경 구분

**필수여부:** 선택 (기본값: "development")

**가능한 값:**
- `development` - 개발 환경
- `production` - 프로덕션
- `test` - 테스트 환경

**개발 환경:**
```env
NODE_ENV="development"
```

**프로덕션 환경:**
```env
NODE_ENV="production"
```

**영향:**
- 에러 메시지 상세도
- 성능 최적화 활성화
- 캐시 정책

---

### DEBUG

**용도:** 디버그 로깅 활성화

**필수여부:** 선택 (기본값: false)

**개발 환경:**
```env
DEBUG="true"
# 또는 특정 네임스페이스
DEBUG="socket*,auth*"
```

**프로덕션 환경:**
```env
DEBUG="false"
```

---

## 12. 환경별 설정 비교표

| 항목 | 개발 | 프로덕션 |
|-----|------|---------|
| NODE_ENV | development | production |
| DATABASE_URL | localhost | RDS/Cloud SQL |
| JWT_EXPIRES_IN | 7d | 24h |
| NEXTAUTH_URL | http://localhost:3000 | https://taeja.world |
| S3/R2 | 테스트 버킷 | 실제 버킷 |
| SMTP_HOST | Gmail (테스트) | 회사 메일 서버 |
| DEBUG | true | false |

---

## 13. 보안 가이드

### 시크릿 관리 모범 사례

1. **절대하면 안 될 것:**
   - .env 파일을 Git에 커밋하기
   - 소스 코드에 하드코딩하기
   - 공개 저장소에 업로드하기

2. **권장 방법:**
   - `.env.local`는 .gitignore에 포함
   - `.env.example`은 샘플만 제공
   - 환경변수는 서버 관리자만 설정
   - 배포 전 모든 시크릿 확인

3. **로테이션:**
   - 정기적으로 API 키 교체
   - 팀원 변경 시 비밀번호 변경
   - 보안 침해 발생 시 즉시 교체

---

## 14. 트러블슈팅

### "DATABASE_URL not found"
```
문제: Prisma가 DATABASE_URL을 찾을 수 없음
해결: .env 파일이 루트에 있는지 확인
```

### "JWT_SECRET too short"
```
문제: JWT 시크릿이 너무 짧음
해결: openssl rand -base64 32로 재생성
```

### "CORS error on socket connection"
```
문제: Socket.io 연결 실패
해결: SOCKET_CORS_ORIGIN이 클라이언트 주소와 일치하는지 확인
```

---

## 15. 체크리스트

개발 시작 전:
- [ ] .env 파일 생성 (`.env.example` 복사)
- [ ] DATABASE_URL 설정
- [ ] JWT_SECRET 생성
- [ ] NEXTAUTH_SECRET 생성
- [ ] 서비스 URL 확인

배포 전:
- [ ] 모든 환경변수 `.env.production`에 설정
- [ ] 외부 서비스 API 키 확인
- [ ] 시크릿 값들이 안전하게 저장됨
- [ ] HTTPS URL만 사용 (프로덕션)

---

**마지막 업데이트:** 2026-03-09
