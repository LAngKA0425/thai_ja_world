-- =============================================
-- 봇 공통 운영 테이블
-- Supabase SQL Editor 에서 순서대로 실행
-- =============================================

-- ──────────────────────────────────────────────
-- 1. summaries 테이블 컬럼 추가 (2단계 파이프라인)
--    이미 summary_title / summary_body / kakao_short / model_used 가 있다면
--    아래 ALTER 만 추가 실행 (없으면 CREATE 로 새로 만들 것)
-- ──────────────────────────────────────────────
ALTER TABLE IF EXISTS summaries
  ADD COLUMN IF NOT EXISTS summary_briefing    TEXT,
  ADD COLUMN IF NOT EXISTS translated_title    TEXT,
  ADD COLUMN IF NOT EXISTS translated_body     TEXT,
  ADD COLUMN IF NOT EXISTS translate_model     TEXT,
  ADD COLUMN IF NOT EXISTS copy_model          TEXT,
  ADD COLUMN IF NOT EXISTS translate_failed    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS copy_failed         BOOLEAN DEFAULT false;

-- ──────────────────────────────────────────────
-- 2. publish_logs 컬럼 추가 (상태머신 통합)
--    기존 review_status='pending' → 'pending_review' 로 마이그레이션 필요
-- ──────────────────────────────────────────────
ALTER TABLE IF EXISTS publish_logs
  ADD COLUMN IF NOT EXISTS notes         TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- 기존 'pending' 상태를 새 상태머신 'pending_review' 로 통일
UPDATE publish_logs
  SET review_status = 'pending_review'
  WHERE review_status = 'pending';

-- ──────────────────────────────────────────────
-- 3. bot_job_logs - 봇 단계별 성공/실패 로그 (뉴스봇 + 레이더봇 공용)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bot_job_logs (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  bot_type      TEXT NOT NULL,       -- 'newsbot' | 'radarbot'
  ref_id        TEXT,                -- processed_news.id 또는 radar_items.id
  stage         TEXT NOT NULL,       -- 'translate' | 'summarize' | 'translate_failed' | 'classify' | ...
  status        TEXT NOT NULL,       -- 'success' | 'failed'
  notes         TEXT,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bjl_bot_type    ON bot_job_logs(bot_type);
CREATE INDEX IF NOT EXISTS idx_bjl_stage       ON bot_job_logs(stage);
CREATE INDEX IF NOT EXISTS idx_bjl_status      ON bot_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_bjl_created     ON bot_job_logs(created_at DESC);

-- ──────────────────────────────────────────────
-- 4. ops_events - 수동 실행/파이프라인 이벤트 로그
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ops_events (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  bot_type   TEXT NOT NULL,    -- 'newsbot' | 'radarbot'
  event      TEXT NOT NULL,    -- 'manual_trigger' | 'cron_run' | 'pipeline_complete' | ...
  step       TEXT,             -- 'collect' | 'process' | 'summarize' | 'all'
  status     TEXT NOT NULL,    -- 'started' | 'success' | 'failed'
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oe_bot_type  ON ops_events(bot_type);
CREATE INDEX IF NOT EXISTS idx_oe_event     ON ops_events(event);
CREATE INDEX IF NOT EXISTS idx_oe_created   ON ops_events(created_at DESC);

-- ──────────────────────────────────────────────
-- 5. radar_items - 레이더봇 수집 항목
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS radar_items (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  source_type      TEXT NOT NULL,    -- 'rss' | 'manual' | 'webhook'
  source_url       TEXT,
  original_title   TEXT,
  original_body    TEXT,
  language         TEXT DEFAULT 'en',
  severity         TEXT,             -- 'critical' | 'high' | 'medium' | 'low'
  category         TEXT,             -- 'safety' | 'scam' | 'weather' | 'visa' | 'traffic' | 'general'
  -- pipeline_status: 파이프라인 단계 (detected→classified→done)
  --   detected: 수집됨, classified: 분류 완료, done: 처리 완료
  pipeline_status  TEXT DEFAULT 'detected',
  -- review_status: 관리자 검토 상태 (상태머신 통일)
  --   pending_review: 검토 대기, approved: 승인, hold: 보류, failed: 실패, published: 게시됨
  review_status    TEXT DEFAULT 'pending_review',
  notes            TEXT,
  error_message    TEXT,
  detected_at      TIMESTAMPTZ DEFAULT now(),
  classified_at    TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ri_status         ON radar_items(status);
CREATE INDEX IF NOT EXISTS idx_ri_review_status  ON radar_items(review_status);
CREATE INDEX IF NOT EXISTS idx_ri_severity       ON radar_items(severity);
CREATE INDEX IF NOT EXISTS idx_ri_created        ON radar_items(created_at DESC);

-- ──────────────────────────────────────────────
-- 6. radar_sources - 레이더봇 소스 목록
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS radar_sources (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT DEFAULT 'rss',   -- 'rss' | 'manual' | 'webhook'
  is_active  BOOLEAN DEFAULT true,
  priority   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
