# 태자월드 Docker + Git 복구 체크리스트

> 최종 작성: 2026-03-09
> 대상 프로젝트: `C:\Users\Langka\dev\taeja-world`
> Docker 프로젝트명 기준: `taeja-world`

---

## 1. Docker Desktop 재실행 전 점검

```powershell
# 1-1. Docker Desktop 이 실행 중인지 확인
docker info

# 1-2. 예전 프로젝트명 "taeja" 로 남은 컨테이너/볼륨/네트워크 확인
docker ps -a --filter "name=taeja" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
docker network ls --filter "name=taeja"
docker volume ls --filter "name=taeja"
```

위 결과에서 `taeja-` 로 시작하는 항목(**taeja-world-** 이 아닌)이 있으면
아래 [2. 중복 프로젝트 정리] 를 먼저 수행합니다.

---

## 2. 중복 프로젝트 (taeja / taeja-world) 정리

```powershell
# 2-1. 예전 "taeja" 프로젝트 컨테이너 전부 중지 + 삭제
docker compose -p taeja down --remove-orphans

# 2-2. 현재 "taeja-world" 도 깨끗하게 내리기
cd C:\Users\Langka\dev\taeja-world
docker compose down --remove-orphans

# 2-3. 예전 볼륨 중 필요 없는 것 정리 (데이터 날아가니 주의!)
#     pgdata 를 유지하려면 이 단계 건너뛰기
# docker volume rm taeja_pgdata        ← 예전 볼륨 (필요 시)

# 2-4. dangling 이미지 / 빌드 캐시 정리
docker image prune -f
docker builder prune -f
```

---

## 3. compose down → build → up 순서

```powershell
cd C:\Users\Langka\dev\taeja-world

# 3-1. 내리기
docker compose down --remove-orphans

# 3-2. 빌드 (캐시 무시하고 깨끗하게)
docker compose build --no-cache

# 3-3. 올리기 (detached)
docker compose up -d

# 3-4. 서비스 상태 확인
docker compose ps
```

정상이면 6개 서비스가 모두 `Up` / `healthy` 상태:
`postgres`, `redis`, `backend`, `worker`, `beat`, `frontend`, `nginx`

---

## 4. Healthcheck 확인 명령

```powershell
# 4-1. 전체 서비스 상태
docker compose ps

# 4-2. backend healthcheck
curl http://localhost/api/v1/health
# 또는 PowerShell:
Invoke-RestMethod http://localhost/api/v1/health

# 4-3. postgres 직접 확인
docker compose exec postgres pg_isready -U taeja

# 4-4. redis 직접 확인
docker compose exec redis redis-cli ping
```

---

## 5. 로그 확인 명령

```powershell
# 전체 로그 (최근 100줄)
docker compose logs --tail=100

# 특정 서비스 로그
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs postgres --tail=30
docker compose logs nginx --tail=30

# 실시간 follow
docker compose logs -f backend
```

---

## 6. 실패 시 우선 확인 5개

| 순서 | 확인 항목 | 명령 |
|------|-----------|------|
| 1 | `.env` 파일 존재 여부 | `dir .env` |
| 2 | postgres 컨테이너 정상 기동 | `docker compose logs postgres --tail=20` |
| 3 | backend 시작 에러 (import/migration) | `docker compose logs backend --tail=30` |
| 4 | 포트 충돌 (80, 3000, 5432, 6379) | `netstat -ano \| findstr "80 3000 5432 6379"` |
| 5 | 예전 taeja 프로젝트 컨테이너 점유 | `docker ps -a --filter "name=taeja"` |

---

## 7. Git 확인 순서 (도커 정리 후)

```powershell
cd C:\Users\Langka\dev\taeja-world

# 7-1. 현재 상태 확인
git status

# 7-2. 추적되면 안 되는 파일 체크
#   .env           → .gitignore 에 있어야 함
#   node_modules/  → .gitignore 에 있어야 함
#   __pycache__/   → .gitignore 에 있어야 함
#   .next/         → .gitignore 에 있어야 함

# 7-3. 변경 내용 확인
git diff --stat

# 7-4. 커밋 전 제외 대상 확인
git diff --cached --stat

# 7-5. 커밋하면 안 되는 파일 목록:
#   .env              (실제 비밀값 포함)
#   *.pyc             (바이트코드)
#   node_modules/     (의존성)
#   .next/            (빌드 산출물)
#   pgdata/           (DB 데이터)
```

### 커밋 안전 절차

```powershell
# 1. 상태 확인
git status

# 2. 변경 파일 리뷰
git diff

# 3. 허용 파일만 스테이징
git add docker-compose.yml
git add docker-compose.dev.yml
git add .env.example
git add docs/ops/docker-git-recovery-checklist.md

# 4. 커밋
git commit -m "infra: Docker 프로젝트명 taeja-world 단일화 + 실행환경 점검"

# 5. 푸시 전 리모트 확인
git remote -v
git log --oneline -5

# 6. 푸시
git push origin main
```

---

## 8. docker-compose.dev.yml 참고

`docker-compose.dev.yml` 은 예전 `apps/` 구조(web, socket-server, admin)용입니다.
현재 메인 실행은 `docker-compose.yml` (app/backend + app/frontend) 기준입니다.

**개발 시**:
```powershell
# 현재 구조 (메인)
docker compose up -d

# 레거시 구조 (apps/) — 필요 시에만
docker compose -f docker-compose.dev.yml up -d
```

두 compose 파일을 동시에 올리면 postgres/redis 포트가 충돌합니다.
**하나만 선택해서 실행하세요.**

---

## 9. 프로젝트명 혼재 요약

| 위치 | 현재값 | 상태 |
|------|--------|------|
| docker-compose.yml `name:` | `taeja-world` | ✅ 정리됨 |
| docker-compose.dev.yml `name:` | `taeja-world` | ✅ 정리됨 |
| DB명 (POSTGRES_DB) | `taeja` | ⚠️ DB명이므로 유지 (변경 시 데이터 손실) |
| DB유저 (POSTGRES_USER) | `taeja` | ⚠️ 유저명이므로 유지 |
| nginx upstream | `backend:8000` / `frontend:3000` | ✅ 정상 |
| .env.example | docker-compose.yml 기준 정렬 | ✅ 정리됨 |
| .env.production.example | 기존 유지 | ✅ 정상 |

> **DB명/유저명 `taeja`는 앱 로직 영역이므로 이번 라운드에서 변경하지 않습니다.**
> 변경 시 기존 pgdata 볼륨의 데이터가 깨지므로, 필요하다면 별도 마이그레이션 계획이 필요합니다.
