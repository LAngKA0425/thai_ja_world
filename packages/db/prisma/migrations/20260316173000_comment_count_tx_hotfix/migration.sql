-- Emergency hotfix: atomic comment write/delete with commentCount consistency

CREATE OR REPLACE FUNCTION public.create_comment_with_count(
  p_post_id TEXT,
  p_author_id TEXT,
  p_content TEXT
)
RETURNS TABLE (
  id TEXT,
  "postId" TEXT,
  "authorId" TEXT,
  content TEXT,
  "createdAt" TIMESTAMPTZ,
  "updatedAt" TIMESTAMPTZ,
  "commentCount" INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment "Comment"%ROWTYPE;
  v_comment_count INTEGER;
BEGIN
  UPDATE "CommunityPost"
  SET "commentCount" = GREATEST("commentCount" + 1, 0)
  WHERE id = p_post_id
  RETURNING "commentCount" INTO v_comment_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_NOT_FOUND';
  END IF;

  INSERT INTO "Comment" (
    "id",
    "postId",
    "authorId",
    content,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    gen_random_uuid()::TEXT,
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

CREATE OR REPLACE FUNCTION public.delete_comment_with_count(
  p_post_id TEXT,
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
  v_comment_count INTEGER;
BEGIN
  DELETE FROM "Comment"
  WHERE id = p_comment_id
    AND "postId" = p_post_id
  RETURNING id INTO v_deleted_comment_id;

  IF v_deleted_comment_id IS NULL THEN
    RAISE EXCEPTION 'COMMENT_NOT_FOUND';
  END IF;

  UPDATE "CommunityPost"
  SET "commentCount" = GREATEST("commentCount" - 1, 0)
  WHERE id = p_post_id
  RETURNING "commentCount" INTO v_comment_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'POST_NOT_FOUND';
  END IF;

  RETURN QUERY SELECT v_comment_count;
END;
$$;
