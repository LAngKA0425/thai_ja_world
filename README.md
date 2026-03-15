# 태자 (thai_ja_world)

한국어 커뮤니티 플랫폼

## 실행 기준 경로
- `C:\dev\taeja-world`

## 회원가입 이메일 인증 env 정책 (중요)
- `apps/web` 는 `apps/web/.env` 또는 `apps/web/.env.local` 을 읽습니다. 루트 `.env` 값은 자동 주입되지 않습니다.
- 서버 전용(Next API route): `SITE_URL`, `BACKEND_INTERNAL_URL`, `BACKEND_INTERNAL_SECRET`, `SMTP_*`, `TURNSTILE_SECRET_KEY`
- 클라이언트 전용: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SOCKET_URL`
- `BACKEND_INTERNAL_SECRET` 는 `app/backend` 의 `SECRET_KEY` 와 동일해야 합니다.

## 현재 실행 기준 구조 (app/*, apps/*)
- Docker Compose 기준 실행 대상: `app/backend`, `app/frontend`, `apps/socket-server`
- `apps/web`, `apps/admin`은 현재 compose에 포함되지 않음 (향후 통합 대상)
- 향후 모노레포 방향: `apps/*` 하위로 서비스 정리, `packages/*` 공용 패키지 유지, `app/*`은 단계적 정리

## 기술 스택
- **Backend**: FastAPI + SQLAlchemy 2 + Alembic + Pydantic v2 + JWT
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + PWA
- **DB**: PostgreSQL 16
- **Cache/Queue**: Redis 7 + Celery
- **Proxy**: Nginx
- **Container**: Docker Compose

## 빠른 시작 (PowerShell, 검증 순서 포함)
```powershell
cd C:\dev\taeja-world

docker compose down -v --remove-orphans
docker compose build --no-cache --progress=plain
docker compose up -d
docker compose ps
docker compose logs -f --tail=200

curl.exe http://localhost
curl.exe http://localhost:8000/api/v1/health
curl.exe http://localhost/minihome/testuser
```

## 운영 명령어 모음 (PowerShell)
```powershell
# 전체 종료
docker compose down -v --remove-orphans

# 전체 빌드
docker compose build --no-cache --progress=plain

# 전체 실행
docker compose up -d

# 전체 로그
docker compose logs -f --tail=200

# 백엔드만 재시작 (worker/beat 포함)
docker compose restart backend worker beat

# 프론트만 재시작
docker compose restart frontend

# 소켓 서버만 재시작
docker compose restart socket-server

# 헬스체크
curl.exe http://localhost:8000/api/v1/health

# localhost 열기
Start-Process http://localhost
```

## 실행 스크립트 (루트 기준)
```powershell
.\scripts\down.ps1
.\scripts\build.ps1
.\scripts\up.ps1
.\scripts\logs.ps1
.\scripts\restart-backend.ps1
.\scripts\restart-frontend.ps1
.\scripts\restart-socket.ps1
.\scripts\health.ps1
.\scripts\open-localhost.ps1
```

## 접속
- 프론트엔드 (nginx): `http://localhost`
- 백엔드 API 직접 접근: `http://localhost:8000`
- Health Check: `http://localhost:8000/api/v1/health`
- 미니홈피 샘플 라우트: `http://localhost/minihome/testuser`

## docker-compose.dev.yml 역할
- 개발용 핫리로드 구성 (nginx 미포함)
- 프론트는 `http://localhost:3000` 직접 접근
- 사용법:
```powershell
docker compose -f docker-compose.dev.yml up -d
```

## /minihome/{handle} 라우트 정책
- `handle`은 **UUID** 또는 **닉네임**을 허용
- 닉네임 입력 시 `GET /api/v1/minihome/resolve/{handle}`로 UUID를 해석
- 닉네임을 찾지 못하면 안내 메시지 표시

## 기본 관리자 계정
- **이메일**: `admin@taeja.local`
- **비밀번호**: `admin1234`
- 앱 최초 실행 시 자동 생성됩니다.

## 실행 실패 시 확인
- `docker compose ps`
- `docker compose logs backend`
- `docker compose logs frontend`
- `docker compose logs nginx`
- `.env` 값 확인 (특히 `SECRET_KEY`, DB/Redis URL)
- 포트 충돌 여부 (80, 3000, 3001, 8000, 5432, 6379)

## 회원가입/로그인 보안 확장 준비
- Anti-abuse 훅: `app/backend/src/core/anti_abuse.py`
- DB 필드 확장: `email_verified`, `phone_verified`, `signup_risk_level`, `signup_risk_score`, `blocked_until`, `auth_provider`, `last_login_ip`, `device_hash`, `suspicious_signup`, `admin_review_required`
- 관리자 화면 API에서 관련 필드 노출 (운영 검토 확장 가능)
- 외부 연동은 미구현: captcha/turnstile, email/SMS verification, passkey(WebAuthn)

## API 엔드포인트 (핵심)
- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `GET /api/v1/minihome/resolve/{handle}`

## 마이그레이션
앱은 시작 시 `create_all`로 자동으로 테이블을 생성합니다.
Alembic을 사용한 마이그레이션이 필요한 경우:
```powershell
docker compose exec backend alembic revision --autogenerate -m "description"
docker compose exec backend alembic upgrade head
```
