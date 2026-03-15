# 태자월드 Quick Start

> 최종 갱신: 2026-03-13
> 대상 환경: Windows PowerShell + Docker Desktop

---

## 사전 조건

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 22+ | web, socket-server |
| pnpm | 9.x | 모노레포 패키지 관리 |
| Python | 3.12+ | backend (FastAPI) |
| Docker Desktop | 최신 | DB/Redis (local dev) 또는 전체 서비스 (docker dev) |

```powershell
# 버전 확인
node -v          # v22.x.x
pnpm -v          # 9.x.x
python --version # 3.12.x
docker --version
```

---

## 환경변수 규칙

| 실행 모드 | .env 위치 | DB host | Redis host |
|-----------|-----------|---------|------------|
| local dev (`pnpm dev`) | 루트 `.env` + `app/backend/.env` | `localhost` | `localhost` |
| docker dev (`pnpm dev:docker`) | 루트 `.env` (+ docker-compose environment 가 host 를 `postgres` / `redis` 로 덮어씀) | `postgres` | `redis` |
| production (`pnpm prod:up`) | 루트 `.env` (+ docker-compose environment 가 host 를 `postgres` / `redis` 로 덮어씀) | `postgres` | `redis` |

**핵심:** `.env` / `.env.example` 은 항상 `localhost` 기준. Docker 에서는 `docker-compose.*.yml` 의 `environment:` 섹션이 서비스명으로 덮어쓴다.

### .env 가 읽히는 위치

- **root `.env`** → backend(FastAPI), socket-server, docker compose env 치환
- **`apps/web/.env` 또는 `apps/web/.env.local`** → web (Next.js 앱 자체 env)
- **docker-compose `environment:`** → docker 모드에서 host 를 서비스명으로 덮어씀 (`.env` 보다 우선)

**주의:** `apps/web` 서버 API route에서 쓰는 `SITE_URL`, `BACKEND_INTERNAL_URL`, `BACKEND_INTERNAL_SECRET` 는 `apps/web/.env`에 반드시 있어야 합니다.

---

## 1. Local Dev (추천 - 가장 빠름)

### 1-1. 최초 설정

```powershell
# 의존성 설치
pnpm install

# 환경변수 복사 (최초 1회)
Copy-Item .env.example .env
Copy-Item .env app\backend\.env

# Python 의존성
pip install -r app\backend\requirements.txt
```

### 1-2. DB / Redis 띄우기 (Docker)

```powershell
# postgres + redis 만 docker 로 실행
pnpm dev:db
```

정상 확인:
```powershell
docker ps
# postgres:16-alpine  0.0.0.0:5432->5432
# redis:7-alpine      0.0.0.0:6379->6379
```

### 1-3. 개발 서버 시작

```powershell
pnpm dev
```

이 명령은 동시에 3개 프로세스를 시작한다:

| 프로세스 | 주소 | 설명 |
|----------|------|------|
| web | http://localhost:3000 | Next.js 프론트엔드 |
| socket | ws://localhost:3001 | Socket.io 실시간 서버 |
| api | http://localhost:8000 | FastAPI 백엔드 |

### 1-4. Health Check

```powershell
# API
curl http://localhost:8000/api/v1/health

# Web
curl http://localhost:3000

# Socket (응답이 오면 정상)
curl http://localhost:3001
```

### 1-5. 종료

```powershell
# Ctrl+C 로 pnpm dev 종료 후:
pnpm dev:db:down
```

---

## 2. Docker Dev (전체 컨테이너)

```powershell
# 전체 서비스 빌드 + 실행
pnpm dev:docker

# 종료
pnpm dev:docker:down
```

포트는 동일: web=3000, api=8000, socket=3001, pg=5432, redis=6379

---

## 3. Build

```powershell
pnpm build
```

`turbo run build` 가 실행되며 아래 워크스페이스를 빌드한다:
- `apps/web` → `next build`
- `apps/socket-server` → `tsc` → `dist/`

---

## 4. Production

```powershell
pnpm prod:up    # docker compose up -d --build
pnpm prod:down  # docker compose down
```

---

## 에러 발생 시 점검 순서

### 1단계: 인프라 확인

```powershell
docker ps                              # postgres, redis 떠 있는지
docker logs taeja-world-postgres-1     # DB 로그
docker logs taeja-world-redis-1        # Redis 로그
```

### 2단계: 환경변수 확인

- 루트 `.env` 에 `DATABASE_URL`, `REDIS_URL` 이 `localhost` 인지 (local dev)
- `app/backend/.env` 도 `localhost` 인지
- docker dev 는 `docker-compose.dev.yml` 의 `environment:` 가 덮어쓰므로 `.env` 수정 불필요

### 3단계: 프로세스별 단독 실행

```powershell
# socket-server 단독 테스트
pnpm --dir apps/socket-server dev

# backend 단독 테스트
python -m uvicorn src.main:app --app-dir app/backend --reload --port 8000

# web 단독 테스트
pnpm --dir apps/web dev
```

---

## 포트 규칙

| 서비스 | 포트 | 비고 |
|--------|------|------|
| web (Next.js) | 3000 | |
| socket-server | 3001 | |
| api (FastAPI) | 8000 | |
| PostgreSQL | 5432 | |
| Redis | 6379 | |
| nginx (prod only) | 80 | |

---

## 스크립트 목록

| 명령 | 설명 |
|------|------|
| `pnpm dev` | local dev (web + socket + api 동시 실행) |
| `pnpm dev:db` | postgres + redis 만 docker 로 실행 |
| `pnpm dev:db:down` | postgres + redis docker 종료 |
| `pnpm dev:docker` | 전체 서비스 docker 실행 |
| `pnpm dev:docker:down` | 전체 docker 종료 |
| `pnpm build` | turbo 워크스페이스 전체 빌드 |
| `pnpm prod:up` | production docker 실행 |
| `pnpm prod:down` | production docker 종료 |

---

## Plaza & Minihome 컴포넌트 참고

### 파일 구조

```
apps/web/src/
├── hooks/
│   ├── usePlaza.ts          (Socket & real-time logic)
│   └── useMinihome.ts       (Minihome data & guestbook)
├── components/
│   ├── plaza/
│   │   ├── PlazaCanvas.tsx
│   │   ├── PlazaChat.tsx
│   │   ├── PlazaChatInput.tsx
│   │   ├── BroadcastBanner.tsx
│   │   ├── UserProfileCard.tsx
│   │   └── *.module.css
│   └── minihome/
│       ├── MinihomeHeader.tsx
│       ├── GuestbookList.tsx
│       ├── GuestbookForm.tsx
│       ├── DecorationSlot.tsx
│       └── *.module.css
└── app/(main)/
    ├── plaza/
    │   └── page.tsx
    └── minihome/[userId]/
        ├── page.tsx
        ├── guestbook/page.tsx
        └── decorate/page.tsx
```

### 테마 색상

```
--primary-pink: #FF6B9D
--secondary-yellow: #FFE66D
--accent-mint: #95E1D3
--cute-peach: #FFD4A3
--cute-purple: #D4A5FF
--cute-blue: #A5D4FF
```
