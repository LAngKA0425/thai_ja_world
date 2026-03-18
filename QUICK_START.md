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
| newsbot-admin (구, 이전 중) | 3099 | localhost:3099 — 마이그레이션 완료 후 제거 |

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

## 봇 실행어 (Bot Commands)

> **사전 조건:** `newsbot/.env` 또는 루트 `.env` 에 `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` 설정 필수.
> Ollama 사용 시 `ollama serve` 가 실행 중이어야 함.

### 뉴스봇 (newsbot)

```powershell
# ── 전체 파이프라인 (수집 → 전처리 → AI요약) ──
pnpm newsbot
# 또는 직접 실행
cd newsbot && npm run pipeline

# ── 단계별 실행 ──
pnpm newsbot:collect      # 1단계: RSS 뉴스 수집 → raw_news 저장
pnpm newsbot:process      # 2단계: 중복 제거 + 카테고리 분류 → processed_news 저장
pnpm newsbot:summarize    # 3단계: Ollama 번역/요약/카피 → summaries + publish_logs(pending_review) 저장

# ── 특수 수집기 ──
pnpm newsbot:weather      # 방콕/파타야 날씨 수집 → CommunityPost 게시
pnpm newsbot:exchange     # THB/KRW 환율 수집 → CommunityPost 게시
pnpm newsbot:daily        # weather + exchange 한 번에 실행

# ── 관리 서버 (구 localhost:3099 — 이전 중) ──
pnpm newsbot:admin        # http://localhost:3099 로 구 관리 서버 실행

# ── 초기 설정 확인 ──
pnpm newsbot:setup        # env + Supabase 연결 + 테이블 존재 여부 확인
```

파이프라인 완료 후 승인 대기 기사는 **태자월드 관리자 페이지 → 뉴스봇 탭** (`/admin`)에서 확인합니다.

### 레이더봇 (radarbot)

```powershell
# ── 전체 파이프라인 (수집 → 분류) ──
pnpm radarbot
# 또는 직접 실행
cd radarbot && npm run pipeline

# ── 단계별 실행 ──
pnpm radarbot:collect     # 수집: radar_sources 소스에서 항목 수집 → radar_items(detected) 저장
pnpm radarbot:classify    # 분류: 위험도(critical/high/medium/low) + 카테고리 분류 → pipeline_status=classified
```

분류 완료 항목은 **태자월드 관리자 페이지 → 뉴스봇 탭** (`/admin`)에서 검토합니다.

### 봇 공통 상태머신

```
[수집] → pending_review → approved → published  ✅ 게시 완료 (변경 불가)
                       → hold       → pending_review  (재검토)
                       → failed     → pending_review  (재시도)
```

승인 없이 자동 게시되지 않습니다. 반드시 관리자 승인 후 게시됩니다.

### 크론 스케줄 예시 (Linux crontab)

```bash
# 매 시간 뉴스봇 파이프라인 실행
0 * * * * cd /path/to/thai_ja_world && pnpm newsbot >> /var/log/newsbot.log 2>&1

# 매일 오전 8시 날씨/환율
0 8 * * * cd /path/to/thai_ja_world && pnpm newsbot:daily >> /var/log/newsbot-daily.log 2>&1

# 매 30분 레이더봇 파이프라인
*/30 * * * * cd /path/to/thai_ja_world && pnpm radarbot >> /var/log/radarbot.log 2>&1
```

### Windows 작업 스케줄러 (PowerShell)

```powershell
# 뉴스봇 전체 파이프라인 1회 실행
Set-Location C:\path\to\thai_ja_world
pnpm newsbot

# 뉴스봇 파이프라인 PowerShell 창에서 반복 실행 (1시간 간격)
while ($true) {
    pnpm newsbot
    Write-Host "$(Get-Date) 완료. 다음 실행까지 1시간 대기..."
    Start-Sleep -Seconds 3600
}
```

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
