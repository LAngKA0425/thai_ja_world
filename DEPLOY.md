# 태자 커뮤니티 배포 가이드

## 아키텍처

```
nginx (80) → frontend (3000) / backend (8000)
backend → postgres (5432), redis (6379)
worker → postgres, redis (Celery worker)
beat → redis (Celery beat scheduler)
```

## 사전 요구사항

- Ubuntu 22.04+
- Docker 24+, Docker Compose v2
- 최소 2GB RAM, 20GB 디스크

## 1. 서버 초기 설정

```bash
# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## 2. 프로젝트 배포

```bash
# 소스 클론
git clone <repo-url> /opt/taeja
cd /opt/taeja

# 환경변수 설정
cp .env.example .env
```

## 3. .env 필수 수정 항목

```env
# 반드시 변경!
POSTGRES_PASSWORD=<강력한비밀번호>
SECRET_KEY=<32자이상랜덤키>
FIRST_ADMIN_PASSWORD=<관리자비밀번호>

# DB URL에도 동일 비밀번호 반영
DATABASE_URL=postgresql+asyncpg://taeja:<비밀번호>@postgres:5432/taeja
SYNC_DATABASE_URL=postgresql://taeja:<비밀번호>@postgres:5432/taeja

# CORS (실제 도메인으로 변경)
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]

# 오픈카톡 링크
OPEN_KAKAO_URL=https://open.kakao.com/o/your-link
```

## 4. 빌드 & 기동

```bash
docker compose up --build -d
```

## 5. 헬스체크

```bash
# 전체 컨테이너 상태
docker compose ps

# 백엔드 헬스
curl -s http://localhost/api/v1/health | python3 -m json.tool

# 프론트엔드
curl -s -o /dev/null -w "%{http_code}" http://localhost/

# 로그 확인
docker compose logs backend --tail=50
docker compose logs worker --tail=50
docker compose logs beat --tail=50
```

## 6. 롤백

```bash
# 이전 이미지로 롤백
docker compose down
git checkout <이전커밋>
docker compose up --build -d

# DB만 롤백 (주의: 데이터 손실 가능)
docker compose exec postgres pg_dump -U taeja taeja > backup_$(date +%Y%m%d).sql
```

## 7. 운영 명령어

```bash
# 로그 실시간
docker compose logs -f backend worker beat

# DB 접속
docker compose exec postgres psql -U taeja taeja

# Celery 작업 상태
docker compose exec worker celery -A src.core.api.v1.domain.workers.celery_app inspect active

# 컨테이너 재시작
docker compose restart backend worker beat

# 전체 재빌드
docker compose down && docker compose up --build -d
```

## 8. 예약 발행 테스트

```bash
# 1. 관리자 로그인
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@taeja.local","password":"admin1234"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. 수동 예약글 생성 (5분 후 발행)
PUBLISH_AT=$(date -u -d '+5 minutes' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+5M -u +%Y-%m-%dT%H:%M:%SZ)
curl -s -X POST http://localhost/api/v1/admin/scheduled \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json'

# 3. 대시보드 확인
curl -s http://localhost/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## 9. 중복 번호 테스트

```bash
# 같은 번호로 2명 가입
curl -s -X POST http://localhost/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test1@test.com","nickname":"test1","password":"test1234","phone":"0812345678"}'

curl -s -X POST http://localhost/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test2@test.com","nickname":"test2","password":"test1234","phone":"081-234-5678"}'

# 관리자에서 알림 확인
curl -s http://localhost/api/v1/admin/notifications \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| nginx | 80 | 리버스 프록시 |
| frontend | 3000 | Next.js SSR |
| backend | 8000 | FastAPI |
| postgres | 5432 | 데이터베이스 |
| redis | 6379 | 캐시/메시지큐 |
| worker | - | Celery 워커 |
| beat | - | Celery 스케줄러 |

## 트러블슈팅

**프론트 빌드 실패**
```bash
docker compose logs frontend
# node_modules 캐시 문제일 경우
docker compose build --no-cache frontend
```

**DB 마이그레이션 에러**
```bash
# 테이블 자동 생성은 lifespan에서 처리됨
# 수동 리셋이 필요한 경우
docker compose down -v  # 주의: 데이터 삭제
docker compose up --build -d
```

**워커가 작업을 안 가져갈 때**
```bash
docker compose restart worker beat
docker compose logs worker --tail=20
```
