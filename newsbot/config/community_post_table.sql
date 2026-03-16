-- =============================================
-- CommunityPost 테이블 (태자월드 게시판)
-- Prisma 스키마 기반 - Supabase SQL Editor에서 실행
-- 이미 존재하면 건너뜀
-- =============================================

CREATE TABLE IF NOT EXISTS "CommunityPost" (
  id TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  category TEXT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  "isAnonymous" BOOLEAN DEFAULT false,
  "moderationStatus" TEXT DEFAULT 'SAFE',
  severity TEXT,
  "viewCount" INTEGER DEFAULT 0,
  "commentCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cp_author ON "CommunityPost"("authorId");
CREATE INDEX IF NOT EXISTS idx_cp_category ON "CommunityPost"(category);
CREATE INDEX IF NOT EXISTS idx_cp_moderation ON "CommunityPost"("moderationStatus");
CREATE INDEX IF NOT EXISTS idx_cp_created ON "CommunityPost"("createdAt");

-- 뉴스봇 시스템 계정 (User 테이블에 없으면 생성)
-- authorId로 사용할 값
-- 실제 User 테이블 구조에 맞게 조정 필요
