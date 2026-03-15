# 태자월드 설치 및 실행 가이드

## 개요

태자월드는 Next.js, Socket.io, Prisma를 활용한 모노레포 기반 플랫폼입니다. 이 문서는 로컬 개발 환경 설정부터 프로덕션 배포까지의 전체 과정을 안내합니다.

**프로젝트 구조:**
- `apps/web` - 메인 웹 서비스 (Next.js, port 3000)
- `apps/socket-server` - 실시간 통신 서버 (Socket.io, port 3001)
- `apps/admin` - 관리자 대시보드 (Next.js, port 3002)
- `packages/db` - 데이터베이스 스키마 (Prisma)
- `packages/shared` - 공용 유틸리티
- `packages/ui` - 공용 UI 컴포넌트
- `packages/config` - 공용 설정
- `packages/locales` - 국제화(i18n) 관련 파일

---

## 1. 필수 요구사항

### 시스템 요구사항
- **Node.js**: 18.0 이상 (20.x LTS 권장)
- **pnpm**: 9.0 이상 (npm 대신 pnpm 사용)
- **PostgreSQL**: 13 이상
- **Docker & Docker Compose** (선택, 로컬 개발 시 편의)
- **Git**: 2.0 이상

### 설치 확인

```bash
# Node.js 확인
node --version  # v18.0.0 이상이어야 함

# pnpm 설치 (npm이 있다면)
npm install -g pnpm@9

# pnpm 확인
pnpm --version  # 9.0.0 이상이어야 함

# PostgreSQL 확인 (로컬 설치 시)
psql --version  # PostgreSQL 13 이상이어야 함
```

---

## 2. 프로젝트 설치 단계

### 2.1 저장소 클론

```bash
git clone https://github.com/your-org/taeja-world.git
cd taeja-world
```

### 2.2 의존성 설치

```bash
# 모든 워크스페이스의 의존성 설치
pnpm install
```

pnpm이 자동으로 워크스페이스의 모든 패키지를 링크하고 의존성을 설치합니다.
`pnpm-workspace.yaml` 파일에서 워크스페이스 정의를 확인할 수 있습니다.

### 2.3 환경변수 파일 생성

```bash
# 루트 디렉토리에서 .env 파일 생성
cp .env.example .env

# 각 앱별 .env 파일 생성 (필요시)
cp apps/web/.env.example apps/web/.env
cp apps/socket-server/.env.example apps/socket-server/.env
cp apps/admin/.env.example apps/admin/.env
```

환경변수 설정에 대한 자세한 내용은 [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)를 참조하세요.

---

## 3. 환경변수 설정 방법

### 3.1 핵심 환경변수 설정

`.env` 파일을 열어 다음 항목들을 수정하세요:

**데이터베이스 (필수)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taeja_world?schema=public"
```

**JWT 시크릿 (필수)**
```bash
# 안전한 시크릿 생성
openssl rand -base64 32

# 생성된 값을 .env에 추가
JWT_SECRET="<생성된-값>"
```

**NextAuth 시크릿 (필수)**
```bash
openssl rand -base64 32

# 생성된 값을 .env에 추가
NEXTAUTH_SECRET="<생성된-값>"
```

**서비스 URL (개발 환경)**
```env
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 3.2 Docker Compose를 이용한 PostgreSQL 실행

프로젝트 루트에 `docker-compose.yml`이 있습니다:

```bash
# PostgreSQL 및 Redis 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f postgres
```

Docker Compose 파일의 기본 설정:
- PostgreSQL: localhost:5432
- 기본 사용자: taeja
- 기본 비밀번호: changeme
- 기본 데이터베이스: taeja

`.env` 파일의 `DATABASE_URL`을 Docker Compose 설정과 일치하도록 수정하세요:
```env
DATABASE_URL="postgresql://taeja:changeme@localhost:5432/taeja?schema=public"
```

### 3.3 로컬 PostgreSQL 사용

Docker를 사용하지 않는 경우:

```bash
# macOS (Homebrew 기준)
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# 데이터베이스 생성
createuser taeja
createdb -O taeja taeja_world

# 비밀번호 설정
psql -U postgres -c "ALTER USER taeja WITH PASSWORD 'your-secure-password';"
```

---

## 4. 데이터베이스 설정 및 마이그레이션

### 4.1 Prisma 클라이언트 생성

```bash
pnpm db:generate
```

이 명령어는 `prisma/schema.prisma`에서 TypeScript 클라이언트를 생성합니다.

### 4.2 데이터베이스 마이그레이션

**개발 환경에서:**

```bash
# 마이그레이션 실행 (개발용, 임시 마이그레이션 생성 포함)
pnpm db:migrate

# 또는 db push 사용 (프로토타입 단계)
pnpm db:push
```

**프로덕션 환경에서:**

```bash
# 명시적 마이그레이션 생성 (권장)
cd packages/db
npx prisma migrate dev --name add_feature_name
```

### 4.3 초기 데이터 입력 (Seed)

```bash
pnpm db:seed
```

seed 파일은 `packages/db/prisma/seed.ts`에 정의되어 있습니다.

### 4.4 Prisma Studio (시각적 데이터 관리)

```bash
pnpm db:studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터를 시각적으로 관리할 수 있습니다.

---

## 5. 각 앱 실행 방법

### 5.1 개발 서버 동시 실행 (권장)

```bash
# 모든 앱을 동시에 실행
pnpm dev
```

이 명령어는 터보 빌드 시스템을 사용하여 모든 앱을 병렬로 실행합니다:
- Web: http://localhost:3000
- Socket Server: ws://localhost:3001
- Admin: http://localhost:3002

### 5.2 개별 앱 실행

```bash
# 웹 앱만 실행
pnpm dev:web

# 소켓 서버만 실행
pnpm dev:socket

# 관리자 앱만 실행
pnpm dev:admin
```

### 5.3 빌드

```bash
# 모든 앱 빌드
pnpm build

# 각 앱의 빌드 확인
ls apps/web/.next
ls apps/admin/.next
```

---

## 6. 개발 서버 동시 실행 (turbo dev)

### 터보 명령어

태자월드는 Turbo를 사용하여 모노레포 내 모든 앱을 효율적으로 관리합니다.

**터보 설정** (`turbo.json`):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

**실행 명령어:**

```bash
# 모든 앱 dev 태스크 동시 실행
pnpm dev

# 특정 앱만 실행 (터미널 필터링)
# Ctrl+C로 모든 프로세스 종료
```

### 터미널 출력 해석

```
▼  UI                                  <프로젝트 이름>
   ✓ dev                               <실행 중 태스크>
│
├─ Packages in scope: web, socket-server, admin
│
└─ Running dev in 3 packages

apps/web:3000 ready                    <앱별 상태>
apps/socket-server:3001 ready
apps/admin:3002 ready
```

---

## 7. 초기 관리자 계정 설정

### 7.1 첫 관리자 계정 생성

개발 환경에서는 `.env` 파일의 다음 항목으로 초기 관리자를 설정할 수 있습니다:

```env
ADMIN_EMAIL="admin@taeja.world"
ADMIN_DEFAULT_PASSWORD="admin123"
```

### 7.2 관리자 대시보드 접속

```
관리자 페이지: http://localhost:3002
로그인 이메일: admin@taeja.world
초기 비밀번호: admin123
```

**주의:** 프로덕션 환경에서는:
1. 강력한 비밀번호로 변경 필수
2. 환경변수를 통해 초기 비밀번호 설정하지 말 것
3. 초기 설정 후 비밀번호 변경 강제

### 7.3 초기 데이터 확인

```bash
# 시드 스크립트 실행
pnpm db:seed

# Prisma Studio에서 확인
pnpm db:studio
```

---

## 8. 사람이 직접 해야 할 연결 작업 목록

다음 항목들은 외부 서비스 계정이 필요하므로 수동으로 설정해야 합니다:

### 8.1 인증 (소셜 로그인)

**Google OAuth**
```env
GOOGLE_CLIENT_ID="<Google Console에서 발급>"
GOOGLE_CLIENT_SECRET="<Google Console에서 발급>"
```

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리다이렉트 URI: `http://localhost:3000/api/auth/callback/google`

**Kakao OAuth**
```env
KAKAO_CLIENT_ID="<Kakao Developers에서 발급>"
KAKAO_CLIENT_SECRET="<Kakao Developers에서 발급>"
```

1. [Kakao Developers](https://developers.kakao.com/)에서 앱 등록
2. REST API 키 및 보안 키 발급
3. Redirect URI: `http://localhost:3000/api/auth/callback/kakao`

### 8.2 결제 게이트웨이

**Toss Payments**
```env
TOSS_PAYMENTS_CLIENT_KEY="<Toss Payments에서 발급>"
TOSS_PAYMENTS_SECRET_KEY="<Toss Payments에서 발급>"
TOSS_PAYMENTS_WEBHOOK_SECRET="<Webhook 설정 시 발급>"
```

1. [Toss Payments](https://developers.tosspayments.com/) 개발자 센터 가입
2. API 키 발급
3. Webhook URL 설정: `https://yourdomain.com/api/payments/webhook`

### 8.3 파일 스토리지

**AWS S3**
```env
S3_BUCKET="taeja-world-bucket"
S3_REGION="ap-northeast-2"
S3_ACCESS_KEY="<AWS IAM 액세스 키>"
S3_SECRET_KEY="<AWS IAM 비밀 액세스 키>"
```

**Cloudflare R2** (S3 호환, 저비용)
```env
R2_ACCOUNT_ID="<Cloudflare 계정 ID>"
R2_ACCESS_KEY="<R2 API 토큰>"
R2_SECRET_KEY="<R2 API 토큰>"
R2_BUCKET="taeja-world"
```

### 8.4 이메일 서비스

**SMTP** (일반)
```env
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@taeja.world"
SMTP_PASS="<메일 서버 비밀번호>"
```

**SendGrid**
```env
SENDGRID_API_KEY="<SendGrid API 키>"
SENDGRID_FROM_EMAIL="noreply@taeja.world"
```

### 8.5 CDN (선택)

**Cloudflare CDN 또는 CloudFront**
```env
NEXT_PUBLIC_CDN_URL="https://cdn.taeja.world"
```

---

## 9. 배포 준비 체크리스트

### 9.1 환경 설정 검수

- [ ] 모든 필수 환경변수 설정 완료 (`.env.production`)
- [ ] 외부 서비스 API 키 확인
- [ ] 데이터베이스 연결 문자열 확인
- [ ] JWT 및 NextAuth 시크릿 설정 (무작위 생성)
- [ ] 서비스 URL이 도메인과 일치

### 9.2 데이터베이스 검수

- [ ] 마이그레이션 파일 모두 커밋됨
- [ ] 프로덕션 데이터베이스 백업 준비
- [ ] Prisma 마이그레이션 실행 성공 확인

### 9.3 빌드 및 테스트

- [ ] `pnpm build` 성공
- [ ] 통합 테스트 실행 및 통과
- [ ] 모든 linting 에러 수정

### 9.4 배포 전 최종 확인

- [ ] 웹, 소켓, 관리자 앱이 정상 작동
- [ ] API 엔드포인트 응답 정상
- [ ] 소켓 연결 정상
- [ ] 관리자 로그인 정상

### 9.5 배포 환경 설정

**Docker 배포:**
```bash
# 도커 이미지 빌드
docker build -f ops/docker/Dockerfile -t taeja-world:latest .

# 컨테이너 실행
docker run -p 3000:3000 -p 3001:3001 -p 3002:3002 \
  --env-file .env.production \
  taeja-world:latest
```

**Vercel 배포 (Next.js 앱):**
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

**자체 서버 배포:**
```bash
# PM2 시작 스크립트 설정
pm2 start ecosystem.config.js

# 자동 재시작 설정
pm2 startup
pm2 save
```

---

## 10. 트러블슈팅

### 문제: `pnpm install` 실패

```bash
# 원인: node_modules 캐시 손상
# 해결책
rm -rf node_modules
pnpm install --force
```

### 문제: PostgreSQL 연결 실패

```bash
# 원인: DATABASE_URL 오류 또는 DB 미실행
# 해결책
# 1. .env 파일의 DATABASE_URL 확인
# 2. PostgreSQL 실행 확인
psql -U taeja -d taeja_world -c "SELECT 1;"
```

### 문제: Prisma 마이그레이션 실패

```bash
# 원인: 스키마 변경이 자동 마이그레이션과 충돌
# 해결책
cd packages/db
npx prisma migrate reset  # 개발 환경에서만
```

### 문제: 포트 충돌

```bash
# 확인
lsof -i :3000
lsof -i :3001
lsof -i :3002

# 포트 변경 (앱의 package.json이나 .env에서)
```

---

## 11. 다음 단계

1. **로컬 개발 시작**
   ```bash
   pnpm dev
   ```

2. **기능 개발**
   - `apps/web` - 사용자 기능
   - `apps/admin` - 관리자 기능
   - `packages/db` - 데이터 모델 변경 시

3. **배포 준비**
   - 모든 체크리스트 항목 확인
   - 스테이징 환경에서 테스트

---

## 추가 리소스

- [Turbo 문서](https://turbo.build/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Socket.io 문서](https://socket.io/docs)
- [프로젝트 아키텍처](./architecture/)

---

**마지막 업데이트:** 2026-03-09
