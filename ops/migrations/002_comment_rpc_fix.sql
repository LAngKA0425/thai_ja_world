-- =============================================
-- 댓글 RPC 함수 수정 및 commentCount 정합성 복구
--
-- 적용 방법: Supabase SQL Editor 에서 전체 실행
-- 적용 순서: 001_bot_unified_tables.sql 이후에 실행
--
-- 수정 내용:
--   1. create_comment_with_count — id 컬럼 누락 버그 수정 (gen_random_uuid()::TEXT 사용)
--   2. delete_comment_with_count — 정상 동작 확인, 재배포
--   3. repair_comment_counts     — commentCount 불일치 일괄 복구
-- =============================================


-- ──────────────────────────────────────────────
-- 1. create_comment_with_count
--    댓글 삽입 + CommunityPost.commentCount 원자적 증가
--
--    버그 이력:
--      - 20260316173000_comment_count_tx_hotfix: id 컬럼 없이 INSERT → NOT NULL 위반
--    수정:
--      - gen_random_uuid()::TEXT 로 id 직접 생성
--      - CommunityPost 잠금을 선행 (SELECT FOR UPDATE) 하여 동시성 안전 보장
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_comment_with_count(
  p_post_id  TEXT,
  p_author_id TEXT,
  p_content  TEXT
)
RETURNS TABLE (
  id            TEXT,
  "postId"      TEXT,
  "authorId"    TEXT,
  content       TEXT,
  "createdAt"   TIMESTAMPTZ,
  "updatedAt"   TIMESTAMPTZ,
  "commentCount" INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment      "Comment"%ROWTYPE;
  v_comment_count INTEGER;
  v_new_id        TEXT;
BEGIN
  -- 게시글을 FOR UPDATE 로 잠근 뒤 카운트 증가 (동시 요청 간 race condition 방지)
  UPDATE "CommunityPost"
  SET    "commentCount" = GREATEST("commentCount" + 1, 0)
  WHERE  id = p_post_id
  RETURNING "commentCount" INTO v_comment_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_NOT_FOUND: postId=%', p_post_id;
  END IF;

  -- id 를 DB 에서 직접 생성 (Prisma CUID 는 클라이언트 생성이므로 DB 측 기본값 없음)
  v_new_id := gen_random_uuid()::TEXT;

  INSERT INTO "Comment" (
    "id",
    "postId",
    "authorId",
    content,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    v_new_id,
    p_post_id,
    p_author_id,
    p_content,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_comment;

  RETURN QUERY
  SELECT
    v_comment.id,
    v_comment."postId",
    v_comment."authorId",
    v_comment.content,
    v_comment."createdAt",
    v_comment."updatedAt",
    v_comment_count;
END;
$$;


-- ──────────────────────────────────────────────
-- 2. delete_comment_with_count
--    댓글 삭제 + CommunityPost.commentCount 원자적 감소
--    GREATEST(..., 0) 으로 음수 방지
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_comment_with_count(
  p_post_id    TEXT,
  p_comment_id TEXT
)
RETURNS TABLE (
  "commentCount" INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_comment_id TEXT;
  v_comment_count      INTEGER;
BEGIN
  DELETE FROM "Comment"
  WHERE  id       = p_comment_id
    AND  "postId" = p_post_id
  RETURNING id INTO v_deleted_comment_id;

  IF v_deleted_comment_id IS NULL THEN
    RAISE EXCEPTION 'COMMENT_NOT_FOUND: commentId=%, postId=%', p_comment_id, p_post_id;
  END IF;

  UPDATE "CommunityPost"
  SET    "commentCount" = GREATEST("commentCount" - 1, 0)
  WHERE  id = p_post_id
  RETURNING "commentCount" INTO v_comment_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_NOT_FOUND: postId=%', p_post_id;
  END IF;

  RETURN QUERY SELECT v_comment_count;
END;
$$;


-- ──────────────────────────────────────────────
-- 3. repair_comment_counts
--    CommunityPost.commentCount 불일치 일괄 복구.
--    실제 Comment row 수로 덮어씀.
--
--    사용법:
--      SELECT * FROM repair_comment_counts();   -- 전체 복구
--
--    반환값:
--      fixed_count  INTEGER  — 수정된 게시글 수
--      total_scanned INTEGER — 스캔한 게시글 수
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.repair_comment_counts()
RETURNS TABLE (
  fixed_count   INTEGER,
  total_scanned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed   INTEGER := 0;
  v_scanned INTEGER := 0;
BEGIN
  WITH actual AS (
    SELECT
      cp.id                            AS post_id,
      cp."commentCount"                AS stored_count,
      COUNT(c.id)::INTEGER             AS real_count
    FROM   "CommunityPost" cp
    LEFT JOIN "Comment" c ON c."postId" = cp.id
    GROUP BY cp.id, cp."commentCount"
    HAVING cp."commentCount" <> COUNT(c.id)::INTEGER
  ),
  repaired AS (
    UPDATE "CommunityPost" cp
    SET    "commentCount" = a.real_count
    FROM   actual a
    WHERE  cp.id = a.post_id
    RETURNING cp.id
  )
  SELECT
    COUNT(*)::INTEGER INTO v_fixed
  FROM repaired;

  SELECT COUNT(*)::INTEGER INTO v_scanned FROM "CommunityPost";

  RETURN QUERY SELECT v_fixed, v_scanned;
END;
$$;


-- ──────────────────────────────────────────────
-- 4. 즉시 복구 실행
--    이 파일을 실행하면 함수 생성 후 자동으로 불일치 복구를 수행합니다.
-- ──────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  SELECT * INTO r FROM repair_comment_counts();
  RAISE NOTICE 'repair_comment_counts 완료: 수정 게시글 수=%, 전체 스캔 수=%', r.fixed_count, r.total_scanned;
END;
$$;


-- ──────────────────────────────────────────────
-- 5. 사용 예시 (참고용 — 실행 불필요)
-- ──────────────────────────────────────────────
/*
-- 댓글 작성 (RPC):
SELECT * FROM create_comment_with_count(
  'post_id_here',
  'author_id_here',
  '댓글 내용입니다'
);

-- 댓글 삭제 (RPC):
SELECT * FROM delete_comment_with_count(
  'post_id_here',
  'comment_id_here'
);

-- 불일치 게시글 수동 확인:
SELECT
  cp.id,
  cp."commentCount"    AS stored,
  COUNT(c.id)::INTEGER AS actual
FROM "CommunityPost" cp
LEFT JOIN "Comment" c ON c."postId" = cp.id
GROUP BY cp.id, cp."commentCount"
HAVING cp."commentCount" <> COUNT(c.id)::INTEGER
ORDER BY cp.id;

-- 수동 전체 복구:
SELECT * FROM repair_comment_counts();
*/
