# TAEJA WORLD — Unified Admin CMS Architecture v1.0

> **Status**: Design Specification
> **Date**: 2026-03-16
> **Scope**: Admin CMS + News Bot Automation — Database Schema, Menu Structure, API Design, Content Workflow

---

## 1. System Overview

TAEJA WORLD Admin CMS는 **데이터 편집 전용 CMS**입니다.
관리자는 콘텐츠(텍스트, 이미지, 뉴스 데이터)를 편집하고, 공개 웹사이트는 DB에서 동적으로 렌더링합니다.

### 핵심 원칙

1. HTML 템플릿 편집 없음 — 모든 콘텐츠는 DB에서 읽음
2. 저장 즉시 반영 — Admin 저장 → Public 사이트 즉시 업데이트
3. 통합 관리 — 웹사이트 콘텐츠 + 뉴스봇 자동화를 단일 대시보드에서 관리
4. 다국어 지원 — Thai / Japanese / English (+ Korean 기존 유지)

### 기존 시스템과의 관계

```
┌──────────────────────────────────────────────────────┐
│                    Nginx :80/:443                     │
├──────────┬──────────┬──────────┬─────────────────────┤
│ /        │ /api/v1  │ /admin   │ /socket.io          │
│ Next.js  │ FastAPI  │ Next.js  │ Socket.IO           │
│ (web)    │ (backend)│ (admin)  │ (socket-server)     │
│ :3000    │ :8000    │ :3100    │ :3001               │
└──────────┴────┬─────┴──────────┴─────────────────────┘
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
   PostgreSQL  Redis   Celery
     :5432     :6379   (worker+beat)
                        │
                        ▼
                   Newsbot Tasks
                   (collect/translate/publish)
```

---

## 2. Admin Menu Structure

```
📊 Dashboard
    ├── 전체 통계 (사용자, 게시물, 뉴스, 방문자)
    ├── 최근 활동 피드
    └── 시스템 상태 (DB, Redis, Bot, Worker)

📄 Content Management
    ├── Homepage Content        (site_content where section='homepage')
    ├── Banners                 (banners)
    ├── Intro / About           (site_content where section='about')
    ├── Multilingual Text       (i18n_content)
    └── Announcements           (announcements)

📰 News Management
    ├── All Articles            (news_articles — 전체 목록)
    ├── Draft Articles          (news_articles where status='draft')
    ├── Pending Review          (news_articles where status='pending')
    ├── Approved / Published    (news_articles where status in ('approved','published'))
    ├── Scheduled Publishing    (scheduled_posts)
    └── Featured News           (news_articles where is_featured=true)

🤖 News Bot Settings
    ├── News Sources            (news_sources)
    ├── Keywords                (bot_keywords)
    ├── Categories              (news_categories)
    ├── Auto Collect ON/OFF     (bot_settings where key='auto_collect')
    ├── Auto Translate ON/OFF   (bot_settings where key='auto_translate')
    └── Auto Publish Rules      (bot_settings where key='auto_publish_*')

🖼️ Media Library
    ├── Images                  (media_library where type='image')
    ├── Thumbnails              (media_library where type='thumbnail')
    └── Upload Manager          (media_library — 업로드 인터페이스)

👥 Users & Permissions
    ├── Admin Users             (admin_users)
    ├── Roles                   (roles)
    └── Permission Control      (permissions + role_permissions)

📋 System Logs
    ├── Content Edit Logs       (admin_audit_logs where target_type in content types)
    ├── Bot Activity Logs       (bot_logs)
    └── Error Logs              (bot_logs where level='error' + system errors)

⚙️ System Settings
    ├── SEO Settings            (system_settings where category='seo')
    ├── Site Metadata           (system_settings where category='metadata')
    └── API Keys                (system_settings where category='api_keys')
```

---

## 3. Database Schema — Complete Table Design

### 3.1 기존 테이블 (변경 없음, 참조만)

기존 모델 파일에 이미 존재하는 테이블:

| Table | Model File | 비고 |
|-------|-----------|------|
| `users` | `models/user.py` | role, status, email_verified 등 |
| `posts` | `models/post.py` | 커뮤니티 게시글 |
| `comments` | `models/post.py` | 댓글 |
| `post_likes` | `models/post.py` | 좋아요 |
| `bookmarks` | `models/post.py` | 북마크 |
| `reports` | `models/moderation.py` | 신고 |
| `banned_keywords` | `models/moderation.py` | 금지어 |
| `user_blocks` | `models/moderation.py` | 차단 |
| `ingested_sources` | `models/admin.py` | 수집 소스 (봇용) |
| `ingested_drafts` | `models/admin.py` | 수집된 초안 |
| `scheduled_posts` | `models/admin.py` | 예약 게시 |
| `admin_audit_logs` | `models/admin.py` | 감사 로그 |
| `admin_notifications` | `models/admin.py` | 관리자 알림 |
| `user_reports` | `models/admin.py` | 사용자 제보 |

### 3.2 신규 테이블 — Admin CMS 전용

---

#### `admin_users`

Admin CMS 전용 로그인 계정. 기존 `users` 테이블과 분리.

```sql
CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role_id         UUID         REFERENCES roles(id),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    last_login_ip   VARCHAR(45),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

#### `roles`

```sql
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL UNIQUE,   -- 'super_admin', 'editor', 'moderator', 'viewer'
    description VARCHAR(200),
    is_system   BOOLEAN      NOT NULL DEFAULT false,  -- 시스템 기본 역할 삭제 불가
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

#### `permissions`

```sql
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,  -- 'content.edit', 'news.approve', 'bot.configure', 'user.manage'
    description VARCHAR(200),
    category    VARCHAR(50)  NOT NULL           -- 'content', 'news', 'bot', 'media', 'user', 'system'
);
```

---

#### `role_permissions`

```sql
CREATE TABLE role_permissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);
```

---

#### `site_content`

홈페이지, About 페이지 등 정적 섹션 콘텐츠.

```sql
CREATE TABLE site_content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section     VARCHAR(50)  NOT NULL,          -- 'homepage', 'about', 'footer', 'contact'
    key         VARCHAR(100) NOT NULL,          -- 'hero_title', 'hero_subtitle', 'intro_text'
    value_th    TEXT,
    value_ja    TEXT,
    value_en    TEXT,
    value_ko    TEXT,
    content_type VARCHAR(20) NOT NULL DEFAULT 'text',  -- 'text', 'html', 'image_url', 'json'
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    updated_by  UUID         REFERENCES admin_users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(section, key)
);

CREATE INDEX idx_site_content_section ON site_content(section, is_active);
```

---

#### `banners`

```sql
CREATE TABLE banners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_th        VARCHAR(200),
    title_ja        VARCHAR(200),
    title_en        VARCHAR(200),
    title_ko        VARCHAR(200),
    subtitle_th     VARCHAR(300),
    subtitle_ja     VARCHAR(300),
    subtitle_en     VARCHAR(300),
    subtitle_ko     VARCHAR(300),
    image_url       VARCHAR(500) NOT NULL,
    mobile_image_url VARCHAR(500),
    link_url        VARCHAR(500),
    link_target     VARCHAR(20)  NOT NULL DEFAULT '_self',  -- '_self', '_blank'
    position        VARCHAR(50)  NOT NULL DEFAULT 'homepage_top',  -- 'homepage_top', 'homepage_mid', 'sidebar'
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    click_count     INTEGER      NOT NULL DEFAULT 0,
    created_by      UUID         REFERENCES admin_users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_banners_active ON banners(position, is_active, sort_order);
```

---

#### `announcements`

```sql
CREATE TABLE announcements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_th    VARCHAR(300),
    title_ja    VARCHAR(300),
    title_en    VARCHAR(300),
    title_ko    VARCHAR(300),
    body_th     TEXT,
    body_ja     TEXT,
    body_en     TEXT,
    body_ko     TEXT,
    type        VARCHAR(20)  NOT NULL DEFAULT 'info',    -- 'info', 'warning', 'urgent', 'maintenance'
    is_pinned   BOOLEAN      NOT NULL DEFAULT false,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    start_date  TIMESTAMPTZ,
    end_date    TIMESTAMPTZ,
    created_by  UUID         REFERENCES admin_users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

#### `i18n_content`

사이트 전체에서 사용하는 다국어 텍스트 키-값 저장소.

```sql
CREATE TABLE i18n_content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace   VARCHAR(50)  NOT NULL,          -- 'common', 'nav', 'footer', 'error', 'meta'
    key         VARCHAR(200) NOT NULL,          -- 'welcome_message', 'nav_home', 'footer_copyright'
    value_th    TEXT,
    value_ja    TEXT,
    value_en    TEXT,
    value_ko    TEXT,
    updated_by  UUID         REFERENCES admin_users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(namespace, key)
);

CREATE INDEX idx_i18n_namespace ON i18n_content(namespace);
```

---

#### `news_categories`

```sql
CREATE TABLE news_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(50)  NOT NULL UNIQUE,   -- 'politics', 'economy', 'lifestyle'
    name_th     VARCHAR(100),
    name_ja     VARCHAR(100),
    name_en     VARCHAR(100),
    name_ko     VARCHAR(100),
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

#### `news_sources`

뉴스봇 RSS/웹 소스. 기존 `ingested_sources`와 역할 유사하나 CMS 확장 필드 추가.
**기존 `ingested_sources` 테이블을 확장하여 사용하거나, newsbot 전용으로 별도 유지.**

```sql
CREATE TABLE news_sources (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(200) NOT NULL,
    type                    VARCHAR(20)  NOT NULL DEFAULT 'rss',  -- 'rss', 'web', 'api', 'manual'
    rss_url                 VARCHAR(500),
    web_url                 VARCHAR(500),
    language                VARCHAR(10)  NOT NULL DEFAULT 'th',   -- 'th', 'ja', 'en', 'ko'
    category_id             UUID         REFERENCES news_categories(id),
    is_active               BOOLEAN      NOT NULL DEFAULT true,
    priority                INTEGER      NOT NULL DEFAULT 0,
    fetch_interval_minutes  INTEGER      NOT NULL DEFAULT 60,
    max_articles_per_fetch  INTEGER      NOT NULL DEFAULT 10,
    last_fetched_at         TIMESTAMPTZ,
    last_fetch_status       VARCHAR(20),   -- 'success', 'failed', 'timeout'
    last_fetch_error        TEXT,
    total_collected         INTEGER      NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

#### `news_articles`

뉴스 기사 본문. 뉴스봇 수집 → 관리자 승인 → 게시 워크플로우.

```sql
CREATE TABLE news_articles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id       UUID         REFERENCES news_sources(id),
    category_id     UUID         REFERENCES news_categories(id),
    external_url    VARCHAR(500),
    external_id     VARCHAR(500),

    -- 원문
    title_original  VARCHAR(500) NOT NULL,
    body_original   TEXT         NOT NULL,
    language_original VARCHAR(10) NOT NULL DEFAULT 'th',

    -- 다국어 번역
    title_th        VARCHAR(500),
    title_ja        VARCHAR(500),
    title_en        VARCHAR(500),
    title_ko        VARCHAR(500),
    body_th         TEXT,
    body_ja         TEXT,
    body_en         TEXT,
    body_ko         TEXT,
    summary_th      TEXT,
    summary_ja      TEXT,
    summary_en      TEXT,
    summary_ko      TEXT,

    -- 메타
    thumbnail_url   VARCHAR(500),
    author          VARCHAR(200),
    tags            JSONB,           -- ["태국", "뉴스", "경제"]

    -- 워크플로우
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                    -- 'draft' → 'pending' → 'approved' → 'published' | 'rejected'
    is_featured     BOOLEAN     NOT NULL DEFAULT false,
    is_translated   BOOLEAN     NOT NULL DEFAULT false,

    -- 승인 추적
    reviewed_by     UUID        REFERENCES admin_users(id),
    reviewed_at     TIMESTAMPTZ,
    review_note     TEXT,
    published_at    TIMESTAMPTZ,
    scheduled_at    TIMESTAMPTZ,       -- NULL이면 즉시 게시, 값 있으면 예약

    -- 통계
    view_count      INTEGER     NOT NULL DEFAULT 0,
    share_count     INTEGER     NOT NULL DEFAULT 0,

    -- 중복 방지
    content_hash    VARCHAR(64) UNIQUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_status ON news_articles(status, created_at DESC);
CREATE INDEX idx_news_featured ON news_articles(is_featured, status, published_at DESC);
CREATE INDEX idx_news_category ON news_articles(category_id, status);
CREATE INDEX idx_news_source ON news_articles(source_id, created_at DESC);
```

---

#### `bot_keywords`

뉴스봇 수집 키워드 필터.

```sql
CREATE TABLE bot_keywords (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword     VARCHAR(200) NOT NULL,
    language    VARCHAR(10)  NOT NULL DEFAULT 'th',
    category_id UUID         REFERENCES news_categories(id),
    is_include  BOOLEAN      NOT NULL DEFAULT true,   -- true=포함 키워드, false=제외 키워드
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_bot_keywords_active ON bot_keywords(is_active, language);
```

---

#### `bot_settings`

뉴스봇 설정 키-값 저장소.

```sql
CREATE TABLE bot_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) NOT NULL UNIQUE,
    value       JSONB        NOT NULL,
    description VARCHAR(300),
    updated_by  UUID         REFERENCES admin_users(id),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 초기 설정값 예시:
-- key='auto_collect'        value='{"enabled": true, "interval_minutes": 60}'
-- key='auto_translate'      value='{"enabled": true, "target_languages": ["ja","en","ko"]}'
-- key='auto_publish_rules'  value='{"enabled": false, "min_score": 0.8, "require_translation": true}'
-- key='collect_schedule'    value='{"cron": "0 */1 * * *"}'
```

---

#### `media_library`

```sql
CREATE TABLE media_library (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        VARCHAR(300) NOT NULL,
    original_name   VARCHAR(300) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT       NOT NULL,       -- bytes
    type            VARCHAR(20)  NOT NULL,        -- 'image', 'thumbnail', 'document', 'video'
    url             VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    width           INTEGER,
    height          INTEGER,
    alt_text_th     VARCHAR(300),
    alt_text_ja     VARCHAR(300),
    alt_text_en     VARCHAR(300),
    alt_text_ko     VARCHAR(300),
    folder          VARCHAR(200) NOT NULL DEFAULT '/',
    uploaded_by     UUID         REFERENCES admin_users(id),
    used_in         JSONB,                        -- 사용처 추적: [{"type":"banner","id":"..."}]
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_type ON media_library(type, created_at DESC);
CREATE INDEX idx_media_folder ON media_library(folder);
```

---

#### `bot_logs`

```sql
CREATE TABLE bot_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task        VARCHAR(50)  NOT NULL,        -- 'collect', 'translate', 'publish', 'schedule'
    level       VARCHAR(10)  NOT NULL DEFAULT 'info',  -- 'info', 'warn', 'error'
    source_id   UUID         REFERENCES news_sources(id),
    article_id  UUID         REFERENCES news_articles(id),
    message     TEXT         NOT NULL,
    details     JSONB,
    duration_ms INTEGER,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_bot_logs_task ON bot_logs(task, created_at DESC);
CREATE INDEX idx_bot_logs_level ON bot_logs(level, created_at DESC);
```

---

#### `system_settings`

```sql
CREATE TABLE system_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category    VARCHAR(50)  NOT NULL,        -- 'seo', 'metadata', 'api_keys', 'general'
    key         VARCHAR(100) NOT NULL,
    value       JSONB        NOT NULL,
    is_secret   BOOLEAN      NOT NULL DEFAULT false,   -- API key 등 마스킹 필요 항목
    description VARCHAR(300),
    updated_by  UUID         REFERENCES admin_users(id),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(category, key)
);

-- 예시:
-- category='seo',      key='default_title',       value='"TAEJA WORLD - 태국/일본 커뮤니티"'
-- category='seo',      key='default_description', value='{"th":"...","ja":"...","en":"...","ko":"..."}'
-- category='metadata', key='site_name',           value='"TAEJA WORLD"'
-- category='api_keys', key='google_translate',    value='"gk_xxx"'  (is_secret=true)
```

---

## 4. Entity Relationship Diagram

```
admin_users ──┬── 1:N ──→ admin_audit_logs
              ├── 1:N ──→ site_content (updated_by)
              ├── 1:N ──→ banners (created_by)
              ├── 1:N ──→ announcements (created_by)
              ├── 1:N ──→ i18n_content (updated_by)
              ├── 1:N ──→ news_articles (reviewed_by)
              ├── 1:N ──→ media_library (uploaded_by)
              ├── 1:N ──→ bot_settings (updated_by)
              └── N:1 ──→ roles

roles ────────── N:N ──→ permissions  (via role_permissions)

news_sources ──┬── 1:N ──→ news_articles
               ├── 1:N ──→ bot_logs
               └── N:1 ──→ news_categories

news_categories ┬── 1:N ──→ news_articles
                ├── 1:N ──→ news_sources
                └── 1:N ──→ bot_keywords

news_articles ──┬── 1:N ──→ bot_logs
                └── N:1 ──→ news_sources, news_categories, admin_users

media_library ──── standalone (참조는 JSONB used_in으로 추적)

bot_settings ──── standalone key-value

system_settings ── standalone key-value
```

---

## 5. News Article Workflow

```
[News Bot Collect]
       │
       ▼
   ┌─────────┐
   │  DRAFT   │  ← 봇이 수집 후 자동 저장
   └────┬─────┘
        │ Admin clicks "Submit for Review"
        ▼
   ┌─────────┐
   │ PENDING  │  ← 검토 대기
   └────┬─────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌────────┐ ┌──────────┐
│APPROVED│ │ REJECTED │  ← 관리자 판단
└───┬────┘ └──────────┘
    │
    │ Admin clicks "Publish" or scheduled_at 도달
    ▼
┌──────────┐
│PUBLISHED │  ← 공개 사이트에 노출
└──────────┘
```

### Status 전이 규칙

| From | To | Trigger | Permission Required |
|------|----|---------|-------------------|
| `draft` | `pending` | Admin submits for review | `news.submit` |
| `pending` | `approved` | Reviewer approves | `news.approve` |
| `pending` | `rejected` | Reviewer rejects | `news.approve` |
| `approved` | `published` | Admin publishes or schedule fires | `news.publish` |
| `published` | `draft` | Admin unpublishes | `news.publish` |
| `rejected` | `draft` | Admin re-edits | `news.edit` |

---

## 6. API Structure — Admin Endpoints

Base path: `/api/v1/admin`

### 6.1 Authentication

```
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/logout
GET    /api/v1/admin/auth/me
POST   /api/v1/admin/auth/refresh
```

**Login Request:**
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Login Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "admin",
    "display_name": "Admin User",
    "role": {
      "id": "uuid",
      "name": "super_admin",
      "permissions": ["content.edit", "news.approve", "bot.configure", "user.manage"]
    }
  }
}
```

### 6.2 Dashboard

```
GET    /api/v1/admin/dashboard/stats
GET    /api/v1/admin/dashboard/recent-activity
GET    /api/v1/admin/dashboard/system-health
```

**Stats Response:**
```json
{
  "users": { "total": 1250, "new_today": 12, "active_today": 340 },
  "posts": { "total": 8500, "new_today": 45 },
  "news": { "total": 3200, "draft": 15, "pending": 8, "published_today": 12 },
  "bot": { "last_run": "2026-03-16T10:00:00Z", "collected_today": 48, "status": "running" }
}
```

### 6.3 Content Management

```
# Site Content
GET    /api/v1/admin/content/sections                    # 섹션 목록
GET    /api/v1/admin/content/sections/{section}          # 특정 섹션의 모든 키
PUT    /api/v1/admin/content/sections/{section}/{key}    # 콘텐츠 수정
POST   /api/v1/admin/content/sections/{section}          # 새 콘텐츠 추가

# Banners
GET    /api/v1/admin/banners
POST   /api/v1/admin/banners
PUT    /api/v1/admin/banners/{id}
DELETE /api/v1/admin/banners/{id}
PATCH  /api/v1/admin/banners/{id}/toggle                 # 활성/비활성
PATCH  /api/v1/admin/banners/reorder                     # 순서 변경

# Announcements
GET    /api/v1/admin/announcements
POST   /api/v1/admin/announcements
PUT    /api/v1/admin/announcements/{id}
DELETE /api/v1/admin/announcements/{id}

# i18n
GET    /api/v1/admin/i18n/namespaces                     # namespace 목록
GET    /api/v1/admin/i18n/{namespace}                    # namespace 내 모든 키
PUT    /api/v1/admin/i18n/{namespace}/{key}              # 번역 수정
POST   /api/v1/admin/i18n/{namespace}                    # 새 키 추가
DELETE /api/v1/admin/i18n/{namespace}/{key}
GET    /api/v1/admin/i18n/export?format=json             # 전체 내보내기
POST   /api/v1/admin/i18n/import                         # JSON 가져오기
```

**Banner Create/Update Request:**
```json
{
  "title_th": "ยินดีต้อนรับ",
  "title_ja": "ようこそ",
  "title_en": "Welcome",
  "title_ko": "환영합니다",
  "image_url": "/media/banners/hero-2026.jpg",
  "mobile_image_url": "/media/banners/hero-2026-mobile.jpg",
  "link_url": "/events/songkran-2026",
  "link_target": "_self",
  "position": "homepage_top",
  "sort_order": 1,
  "is_active": true,
  "start_date": "2026-03-16T00:00:00Z",
  "end_date": "2026-04-30T23:59:59Z"
}
```

### 6.4 News Management

```
# Articles
GET    /api/v1/admin/news/articles                        # 필터: ?status=&category=&source=&page=&limit=
GET    /api/v1/admin/news/articles/{id}
POST   /api/v1/admin/news/articles                        # 수동 기사 작성
PUT    /api/v1/admin/news/articles/{id}
DELETE /api/v1/admin/news/articles/{id}

# Workflow actions
PATCH  /api/v1/admin/news/articles/{id}/submit            # draft → pending
PATCH  /api/v1/admin/news/articles/{id}/approve           # pending → approved
PATCH  /api/v1/admin/news/articles/{id}/reject            # pending → rejected
PATCH  /api/v1/admin/news/articles/{id}/publish           # approved → published
PATCH  /api/v1/admin/news/articles/{id}/unpublish         # published → draft
PATCH  /api/v1/admin/news/articles/{id}/feature           # 추천 토글
PATCH  /api/v1/admin/news/articles/{id}/schedule          # 예약 게시 설정

# Bulk operations
POST   /api/v1/admin/news/articles/bulk/approve           # {"ids": ["uuid1", "uuid2"]}
POST   /api/v1/admin/news/articles/bulk/reject
POST   /api/v1/admin/news/articles/bulk/publish
POST   /api/v1/admin/news/articles/bulk/delete

# Categories
GET    /api/v1/admin/news/categories
POST   /api/v1/admin/news/categories
PUT    /api/v1/admin/news/categories/{id}
DELETE /api/v1/admin/news/categories/{id}
```

**Article Approve Request:**
```json
{
  "review_note": "내용 확인 완료. 게시 승인."
}
```

**Article Approve Response:**
```json
{
  "id": "uuid",
  "status": "approved",
  "reviewed_by": "uuid",
  "reviewed_at": "2026-03-16T11:30:00Z",
  "review_note": "내용 확인 완료. 게시 승인."
}
```

### 6.5 News Bot Settings

```
GET    /api/v1/admin/bot/settings                         # 전체 설정
PUT    /api/v1/admin/bot/settings/{key}                   # 개별 설정 수정

# Sources
GET    /api/v1/admin/bot/sources
POST   /api/v1/admin/bot/sources
PUT    /api/v1/admin/bot/sources/{id}
DELETE /api/v1/admin/bot/sources/{id}
PATCH  /api/v1/admin/bot/sources/{id}/toggle              # 활성/비활성
POST   /api/v1/admin/bot/sources/{id}/test-fetch          # 테스트 수집

# Keywords
GET    /api/v1/admin/bot/keywords
POST   /api/v1/admin/bot/keywords
PUT    /api/v1/admin/bot/keywords/{id}
DELETE /api/v1/admin/bot/keywords/{id}

# Manual trigger
POST   /api/v1/admin/bot/collect/trigger                  # 수동 수집 시작
POST   /api/v1/admin/bot/translate/trigger                # 수동 번역 시작
GET    /api/v1/admin/bot/status                           # 봇 현재 상태
```

**Bot Settings Update Request:**
```json
{
  "value": {
    "enabled": true,
    "interval_minutes": 30,
    "target_languages": ["ja", "en", "ko"]
  }
}
```

### 6.6 Media Library

```
GET    /api/v1/admin/media                                # ?type=&folder=&page=&limit=
POST   /api/v1/admin/media/upload                         # multipart/form-data
DELETE /api/v1/admin/media/{id}
PUT    /api/v1/admin/media/{id}                           # alt text 등 메타 수정
GET    /api/v1/admin/media/folders
POST   /api/v1/admin/media/folders                        # 폴더 생성
```

**Upload Response:**
```json
{
  "id": "uuid",
  "filename": "hero-banner-2026.jpg",
  "url": "/media/uploads/2026/03/hero-banner-2026.jpg",
  "thumbnail_url": "/media/uploads/2026/03/thumb_hero-banner-2026.jpg",
  "mime_type": "image/jpeg",
  "file_size": 245000,
  "width": 1920,
  "height": 600
}
```

### 6.7 Users & Permissions

```
# Admin Users
GET    /api/v1/admin/users
POST   /api/v1/admin/users
PUT    /api/v1/admin/users/{id}
DELETE /api/v1/admin/users/{id}
PATCH  /api/v1/admin/users/{id}/toggle-active
POST   /api/v1/admin/users/{id}/reset-password

# Roles
GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
PUT    /api/v1/admin/roles/{id}
DELETE /api/v1/admin/roles/{id}

# Permissions
GET    /api/v1/admin/permissions                          # 전체 권한 목록
```

### 6.8 Logs

```
GET    /api/v1/admin/logs/audit          # ?admin_id=&target_type=&action=&from=&to=&page=&limit=
GET    /api/v1/admin/logs/bot            # ?task=&level=&source_id=&from=&to=&page=&limit=
GET    /api/v1/admin/logs/errors         # ?from=&to=&page=&limit=
```

### 6.9 System Settings

```
GET    /api/v1/admin/settings                             # 전체 (is_secret=true인 값은 마스킹)
GET    /api/v1/admin/settings/{category}
PUT    /api/v1/admin/settings/{category}/{key}
```

---

## 7. Public API — Website Data Endpoints

공개 웹사이트가 DB에서 콘텐츠를 읽는 엔드포인트.

```
GET    /api/v1/public/content/{section}                   # 홈페이지, about 등
GET    /api/v1/public/banners?position=homepage_top       # 활성 배너
GET    /api/v1/public/announcements                       # 활성 공지
GET    /api/v1/public/i18n/{namespace}?lang=th            # 다국어 텍스트
GET    /api/v1/public/news?category=&featured=&page=&limit=  # 게시된 뉴스
GET    /api/v1/public/news/{id}                           # 뉴스 상세 (published만)
GET    /api/v1/public/news/categories                     # 뉴스 카테고리
GET    /api/v1/public/seo/{page}                          # SEO 메타데이터
```

---

## 8. Permission Matrix

| Permission Code | super_admin | editor | moderator | viewer |
|----------------|:-----------:|:------:|:---------:|:------:|
| `content.view` | ✅ | ✅ | ✅ | ✅ |
| `content.edit` | ✅ | ✅ | ❌ | ❌ |
| `news.view` | ✅ | ✅ | ✅ | ✅ |
| `news.edit` | ✅ | ✅ | ❌ | ❌ |
| `news.submit` | ✅ | ✅ | ❌ | ❌ |
| `news.approve` | ✅ | ❌ | ✅ | ❌ |
| `news.publish` | ✅ | ❌ | ❌ | ❌ |
| `bot.view` | ✅ | ✅ | ✅ | ✅ |
| `bot.configure` | ✅ | ❌ | ❌ | ❌ |
| `bot.trigger` | ✅ | ✅ | ❌ | ❌ |
| `media.view` | ✅ | ✅ | ✅ | ✅ |
| `media.upload` | ✅ | ✅ | ❌ | ❌ |
| `media.delete` | ✅ | ❌ | ❌ | ❌ |
| `user.view` | ✅ | ❌ | ✅ | ❌ |
| `user.manage` | ✅ | ❌ | ❌ | ❌ |
| `log.view` | ✅ | ❌ | ✅ | ❌ |
| `system.settings` | ✅ | ❌ | ❌ | ❌ |

---

## 9. Newsbot Integration Model

### 수집 → 게시 전체 파이프라인

```
[Celery Beat Scheduler]
        │
        │ cron: bot_settings['collect_schedule']
        ▼
[Collect Task]
        │  news_sources에서 활성 소스 조회
        │  RSS/Web 파싱
        │  bot_keywords로 필터링
        │  중복 체크 (content_hash)
        ▼
[news_articles INSERT (status='draft')]
        │
        │  bot_settings['auto_translate'].enabled == true
        ▼
[Translate Task]
        │  Google Translate API / DeepL
        │  title_th → title_ja, title_en, title_ko
        │  body_th → body_ja, body_en, body_ko
        │  summary 생성
        ▼
[news_articles UPDATE (is_translated=true)]
        │
        │  bot_settings['auto_publish_rules'].enabled == true
        │  AND min_score 충족
        ▼
[Auto Submit → status='pending']
        │
        ▼
[Admin Dashboard — Pending Review Queue]
        │  관리자가 검토
        ▼
[Approve → Publish]  또는  [Reject]
```

### Celery Task 등록

```python
# tasks/newsbot.py (FastAPI Celery worker에 등록)

@celery_app.task(name="newsbot.collect")
def collect_news():
    """모든 활성 소스에서 뉴스 수집"""

@celery_app.task(name="newsbot.translate")
def translate_articles():
    """미번역 기사 번역"""

@celery_app.task(name="newsbot.auto_submit")
def auto_submit_articles():
    """자동 제출 규칙에 따라 draft → pending"""

@celery_app.task(name="newsbot.publish_scheduled")
def publish_scheduled():
    """scheduled_at 도달한 approved 기사 게시"""
```

---

## 10. Real-time Update Strategy

Admin 저장 → Public 사이트 즉시 반영을 위한 구조.

### 방법 1: Redis Pub/Sub + Socket.IO (권장)

```
[Admin saves content]
       │
       ▼
[FastAPI endpoint]
       │  1. DB UPDATE
       │  2. Redis PUBLISH "cms:content_updated" { section, key }
       ▼
[Socket.IO Server]
       │  subscribes to "cms:*"
       │  broadcasts to connected Next.js clients
       ▼
[Next.js (web)]
       │  receives event
       │  revalidates ISR cache or refetches
       ▼
[User sees updated content]
```

### 방법 2: Next.js On-Demand Revalidation (심플)

```
[Admin saves content]
       │
       ▼
[FastAPI endpoint]
       │  1. DB UPDATE
       │  2. POST http://web:3000/api/revalidate?secret=xxx&path=/
       ▼
[Next.js ISR revalidation triggered]
       │
       ▼
[Next page request serves fresh data]
```

---

## 11. Migration SQL — 전체 실행 스크립트

아래 SQL을 순서대로 실행하면 모든 CMS 테이블이 생성됩니다.

```sql
-- ============================================
-- TAEJA WORLD Admin CMS — Migration Script
-- Version: 1.0
-- Date: 2026-03-16
-- ============================================

BEGIN;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200),
    is_system   BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(200),
    category    VARCHAR(50)  NOT NULL
);

-- 3. Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- 4. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role_id         UUID         REFERENCES roles(id),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    last_login_ip   VARCHAR(45),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 5. Site Content
CREATE TABLE IF NOT EXISTS site_content (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section      VARCHAR(50)  NOT NULL,
    key          VARCHAR(100) NOT NULL,
    value_th     TEXT,
    value_ja     TEXT,
    value_en     TEXT,
    value_ko     TEXT,
    content_type VARCHAR(20)  NOT NULL DEFAULT 'text',
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    updated_by   UUID         REFERENCES admin_users(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(section, key)
);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section, is_active);

-- 6. Banners
CREATE TABLE IF NOT EXISTS banners (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_th         VARCHAR(200),
    title_ja         VARCHAR(200),
    title_en         VARCHAR(200),
    title_ko         VARCHAR(200),
    subtitle_th      VARCHAR(300),
    subtitle_ja      VARCHAR(300),
    subtitle_en      VARCHAR(300),
    subtitle_ko      VARCHAR(300),
    image_url        VARCHAR(500) NOT NULL,
    mobile_image_url VARCHAR(500),
    link_url         VARCHAR(500),
    link_target      VARCHAR(20)  NOT NULL DEFAULT '_self',
    position         VARCHAR(50)  NOT NULL DEFAULT 'homepage_top',
    sort_order       INTEGER      NOT NULL DEFAULT 0,
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    start_date       TIMESTAMPTZ,
    end_date         TIMESTAMPTZ,
    click_count      INTEGER      NOT NULL DEFAULT 0,
    created_by       UUID         REFERENCES admin_users(id),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(position, is_active, sort_order);

-- 7. Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_th    VARCHAR(300),
    title_ja    VARCHAR(300),
    title_en    VARCHAR(300),
    title_ko    VARCHAR(300),
    body_th     TEXT,
    body_ja     TEXT,
    body_en     TEXT,
    body_ko     TEXT,
    type        VARCHAR(20)  NOT NULL DEFAULT 'info',
    is_pinned   BOOLEAN      NOT NULL DEFAULT false,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    start_date  TIMESTAMPTZ,
    end_date    TIMESTAMPTZ,
    created_by  UUID         REFERENCES admin_users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 8. i18n Content
CREATE TABLE IF NOT EXISTS i18n_content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace   VARCHAR(50)  NOT NULL,
    key         VARCHAR(200) NOT NULL,
    value_th    TEXT,
    value_ja    TEXT,
    value_en    TEXT,
    value_ko    TEXT,
    updated_by  UUID         REFERENCES admin_users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(namespace, key)
);
CREATE INDEX IF NOT EXISTS idx_i18n_namespace ON i18n_content(namespace);

-- 9. News Categories
CREATE TABLE IF NOT EXISTS news_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    name_th     VARCHAR(100),
    name_ja     VARCHAR(100),
    name_en     VARCHAR(100),
    name_ko     VARCHAR(100),
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 10. News Sources
CREATE TABLE IF NOT EXISTS news_sources (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(200) NOT NULL,
    type                   VARCHAR(20)  NOT NULL DEFAULT 'rss',
    rss_url                VARCHAR(500),
    web_url                VARCHAR(500),
    language               VARCHAR(10)  NOT NULL DEFAULT 'th',
    category_id            UUID         REFERENCES news_categories(id),
    is_active              BOOLEAN      NOT NULL DEFAULT true,
    priority               INTEGER      NOT NULL DEFAULT 0,
    fetch_interval_minutes INTEGER      NOT NULL DEFAULT 60,
    max_articles_per_fetch INTEGER      NOT NULL DEFAULT 10,
    last_fetched_at        TIMESTAMPTZ,
    last_fetch_status      VARCHAR(20),
    last_fetch_error       TEXT,
    total_collected        INTEGER      NOT NULL DEFAULT 0,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 11. News Articles
CREATE TABLE IF NOT EXISTS news_articles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id         UUID         REFERENCES news_sources(id),
    category_id       UUID         REFERENCES news_categories(id),
    external_url      VARCHAR(500),
    external_id       VARCHAR(500),
    title_original    VARCHAR(500) NOT NULL,
    body_original     TEXT         NOT NULL,
    language_original VARCHAR(10)  NOT NULL DEFAULT 'th',
    title_th          VARCHAR(500),
    title_ja          VARCHAR(500),
    title_en          VARCHAR(500),
    title_ko          VARCHAR(500),
    body_th           TEXT,
    body_ja           TEXT,
    body_en           TEXT,
    body_ko           TEXT,
    summary_th        TEXT,
    summary_ja        TEXT,
    summary_en        TEXT,
    summary_ko        TEXT,
    thumbnail_url     VARCHAR(500),
    author            VARCHAR(200),
    tags              JSONB,
    status            VARCHAR(20)  NOT NULL DEFAULT 'draft',
    is_featured       BOOLEAN      NOT NULL DEFAULT false,
    is_translated     BOOLEAN      NOT NULL DEFAULT false,
    reviewed_by       UUID         REFERENCES admin_users(id),
    reviewed_at       TIMESTAMPTZ,
    review_note       TEXT,
    published_at      TIMESTAMPTZ,
    scheduled_at      TIMESTAMPTZ,
    view_count        INTEGER      NOT NULL DEFAULT 0,
    share_count       INTEGER      NOT NULL DEFAULT 0,
    content_hash      VARCHAR(64)  UNIQUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_articles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news_articles(is_featured, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category_id, status);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source_id, created_at DESC);

-- 12. Bot Keywords
CREATE TABLE IF NOT EXISTS bot_keywords (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword     VARCHAR(200) NOT NULL,
    language    VARCHAR(10)  NOT NULL DEFAULT 'th',
    category_id UUID         REFERENCES news_categories(id),
    is_include  BOOLEAN      NOT NULL DEFAULT true,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bot_keywords_active ON bot_keywords(is_active, language);

-- 13. Bot Settings
CREATE TABLE IF NOT EXISTS bot_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) NOT NULL UNIQUE,
    value       JSONB        NOT NULL,
    description VARCHAR(300),
    updated_by  UUID         REFERENCES admin_users(id),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 14. Media Library
CREATE TABLE IF NOT EXISTS media_library (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename        VARCHAR(300) NOT NULL,
    original_name   VARCHAR(300) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT       NOT NULL,
    type            VARCHAR(20)  NOT NULL,
    url             VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    width           INTEGER,
    height          INTEGER,
    alt_text_th     VARCHAR(300),
    alt_text_ja     VARCHAR(300),
    alt_text_en     VARCHAR(300),
    alt_text_ko     VARCHAR(300),
    folder          VARCHAR(200) NOT NULL DEFAULT '/',
    uploaded_by     UUID         REFERENCES admin_users(id),
    used_in         JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_library(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);

-- 15. Bot Logs
CREATE TABLE IF NOT EXISTS bot_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task        VARCHAR(50)  NOT NULL,
    level       VARCHAR(10)  NOT NULL DEFAULT 'info',
    source_id   UUID         REFERENCES news_sources(id),
    article_id  UUID         REFERENCES news_articles(id),
    message     TEXT         NOT NULL,
    details     JSONB,
    duration_ms INTEGER,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bot_logs_task ON bot_logs(task, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level, created_at DESC);

-- 16. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category    VARCHAR(50)  NOT NULL,
    key         VARCHAR(100) NOT NULL,
    value       JSONB        NOT NULL,
    is_secret   BOOLEAN      NOT NULL DEFAULT false,
    description VARCHAR(300),
    updated_by  UUID         REFERENCES admin_users(id),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE(category, key)
);

-- ============================================
-- Seed Data
-- ============================================

-- Default Roles
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Full system access', true),
    ('editor', 'Content and news editing', true),
    ('moderator', 'Review and moderation', true),
    ('viewer', 'Read-only access', true)
ON CONFLICT (name) DO NOTHING;

-- Default Permissions
INSERT INTO permissions (code, description, category) VALUES
    ('content.view', 'View site content', 'content'),
    ('content.edit', 'Edit site content', 'content'),
    ('news.view', 'View news articles', 'news'),
    ('news.edit', 'Edit news articles', 'news'),
    ('news.submit', 'Submit articles for review', 'news'),
    ('news.approve', 'Approve/reject articles', 'news'),
    ('news.publish', 'Publish articles', 'news'),
    ('bot.view', 'View bot status', 'bot'),
    ('bot.configure', 'Configure bot settings', 'bot'),
    ('bot.trigger', 'Manually trigger bot tasks', 'bot'),
    ('media.view', 'View media library', 'media'),
    ('media.upload', 'Upload media', 'media'),
    ('media.delete', 'Delete media', 'media'),
    ('user.view', 'View admin users', 'user'),
    ('user.manage', 'Manage admin users', 'user'),
    ('log.view', 'View system logs', 'log'),
    ('system.settings', 'Manage system settings', 'system')
ON CONFLICT (code) DO NOTHING;

-- super_admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- editor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'editor' AND p.code IN (
    'content.view', 'content.edit',
    'news.view', 'news.edit', 'news.submit',
    'bot.view', 'bot.trigger',
    'media.view', 'media.upload'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- moderator permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'moderator' AND p.code IN (
    'content.view',
    'news.view', 'news.approve',
    'bot.view',
    'media.view',
    'user.view',
    'log.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- viewer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'viewer' AND p.code IN (
    'content.view', 'news.view', 'bot.view', 'media.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Default Bot Settings
INSERT INTO bot_settings (key, value, description) VALUES
    ('auto_collect', '{"enabled": true, "interval_minutes": 60}', 'Auto-collect news from sources'),
    ('auto_translate', '{"enabled": true, "target_languages": ["ja", "en", "ko"], "provider": "google"}', 'Auto-translate collected articles'),
    ('auto_publish_rules', '{"enabled": false, "min_score": 0.8, "require_translation": true, "require_review": true}', 'Rules for auto-publishing'),
    ('collect_schedule', '{"cron": "0 */1 * * *"}', 'Cron schedule for collection')
ON CONFLICT (key) DO NOTHING;

-- Default News Categories
INSERT INTO news_categories (slug, name_th, name_ja, name_en, name_ko, sort_order) VALUES
    ('politics', 'การเมือง', '政治', 'Politics', '정치', 1),
    ('economy', 'เศรษฐกิจ', '経済', 'Economy', '경제', 2),
    ('society', 'สังคม', '社会', 'Society', '사회', 3),
    ('lifestyle', 'ไลฟ์สไตล์', 'ライフスタイル', 'Lifestyle', '라이프스타일', 4),
    ('travel', 'ท่องเที่ยว', '旅行', 'Travel', '여행', 5),
    ('food', 'อาหาร', 'グルメ', 'Food', '음식', 6),
    ('sports', 'กีฬา', 'スポーツ', 'Sports', '스포츠', 7),
    ('technology', 'เทคโนโลยี', 'テクノロジー', 'Technology', '기술', 8),
    ('entertainment', 'บันเทิง', 'エンターテイメント', 'Entertainment', '엔터테인먼트', 9),
    ('expat', 'ชาวต่างชาติ', '在住外国人', 'Expat Living', '교민', 10)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
```

---

## 12. Alembic Migration 파일 위치

기존 프로젝트 구조에 맞게:

```
app/backend/
├── alembic.ini
├── src/core/api/v1/domain/models/
│   ├── admin.py          ← 기존 (IngestedSource, IngestedDraft, etc.)
│   ├── admin_cms.py      ← 신규 (AdminUser, Role, Permission, etc.)
│   ├── content.py        ← 신규 (SiteContent, Banner, Announcement, I18nContent)
│   ├── news.py           ← 신규 (NewsCategory, NewsSource, NewsArticle, BotKeyword)
│   ├── media.py          ← 확장 (MediaLibrary)
│   └── settings.py       ← 신규 (BotSetting, SystemSetting, BotLog)
```

---

## 13. 기존 newsbot 연동 계획

현재 `newsbot/collector/collect.js`는 Supabase 클라이언트를 사용하여 `news_sources` → `raw_news` 테이블에 저장합니다.

### 통합 방안

| 현재 (newsbot) | 통합 후 (Admin CMS) | 변경 사항 |
|---------------|-------------------|----------|
| `news_sources` (Supabase) | `news_sources` (PostgreSQL 직접) | Supabase → 직접 DB 연결 또는 FastAPI API 호출로 전환 |
| `raw_news` (Supabase) | `news_articles` (status='draft') | 수집된 기사를 news_articles에 직접 INSERT |
| 없음 | `bot_logs` | 수집 로그 기록 추가 |
| 없음 | `bot_settings` | 설정을 DB에서 읽어 동적 제어 |

### 전환 옵션

**Option A**: newsbot을 FastAPI Celery task로 마이그레이션 (권장)
- `collect.js` 로직을 Python으로 재작성
- Celery Beat으로 스케줄링
- 동일 DB 직접 접근

**Option B**: newsbot 유지 + Admin API 호출
- `collect.js`가 FastAPI Admin API를 호출하여 기사 저장
- API 키 인증 사용
- 기존 Node.js 코드 최소 변경

---

## 14. 출시 전 체크포인트

- [ ] 모든 CMS 테이블 마이그레이션 완료
- [ ] admin_users 초기 super_admin 계정 생성
- [ ] RBAC 권한 체계 동작 확인
- [ ] 뉴스 워크플로우 (draft → pending → approved → published) 전체 흐름 테스트
- [ ] 다국어 콘텐츠 CRUD 동작 확인
- [ ] 미디어 업로드 + 썸네일 생성 동작 확인
- [ ] 뉴스봇 수집 → news_articles 저장 연동 확인
- [ ] Public API에서 게시된 콘텐츠 정상 조회 확인
- [ ] Admin 저장 → Public 사이트 즉시 반영 확인
- [ ] admin audit log 기록 확인
- [ ] bot_logs 기록 확인
- [ ] CORS 설정: admin 도메인 추가
- [ ] Admin JWT 토큰과 Public JWT 토큰 분리 확인
- [ ] pnpm build 통과
- [ ] docker-compose에 admin 서비스 추가
