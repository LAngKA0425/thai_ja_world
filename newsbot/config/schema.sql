-- =============================================
-- 태자월드 뉴스봇 Supabase 스키마
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. 뉴스 소스 설정 테이블
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rss_url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'rss',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 수집된 원본 뉴스
CREATE TABLE IF NOT EXISTS raw_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES news_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ,
  author TEXT,
  raw_content TEXT,
  meta JSONB DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 전처리된 뉴스
CREATE TABLE IF NOT EXISTS processed_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_news_id UUID REFERENCES raw_news(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  body_text TEXT,
  language TEXT,
  category TEXT DEFAULT 'news',
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES processed_news(id),
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AI 요약 결과
CREATE TABLE IF NOT EXISTS summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  processed_news_id UUID REFERENCES processed_news(id) ON DELETE CASCADE UNIQUE,
  summary_title TEXT NOT NULL,
  summary_body TEXT NOT NULL,
  kakao_short TEXT,
  model_used TEXT DEFAULT 'ollama',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 발행 로그
CREATE TABLE IF NOT EXISTS publish_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_id UUID REFERENCES summaries(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  review_status TEXT NOT NULL DEFAULT 'pending',
  publish_category TEXT DEFAULT 'news',
  published_at TIMESTAMPTZ,
  published_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_raw_news_link ON raw_news(link);
CREATE INDEX IF NOT EXISTS idx_raw_news_collected ON raw_news(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_processed_category ON processed_news(category);
CREATE INDEX IF NOT EXISTS idx_publish_status ON publish_logs(review_status);
CREATE INDEX IF NOT EXISTS idx_publish_created ON publish_logs(created_at DESC);

-- RLS 정책 (필요시 활성화)
-- ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE raw_news ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processed_news ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE publish_logs ENABLE ROW LEVEL SECURITY;

-- 기본 뉴스 소스 삽입
INSERT INTO news_sources (name, rss_url, source_type, priority) VALUES
  ('Bangkok Post', 'https://www.bangkokpost.com/rss/data/topstories.xml', 'rss', 1),
  ('Thaiger', 'https://thethaiger.com/feed', 'rss', 2),
  ('Google News Thailand', 'https://news.google.com/rss/search?q=Thailand&hl=en&gl=TH&ceid=TH:en', 'rss', 3)
ON CONFLICT (rss_url) DO NOTHING;
