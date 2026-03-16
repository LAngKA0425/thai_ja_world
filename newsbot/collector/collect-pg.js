/**
 * RSS 수집기 — PostgreSQL 직접 저장 버전.
 *
 * 아키텍처 규칙:
 *   - 수집된 기사는 news_articles 테이블에 status='draft' 로만 저장
 *   - 봇이 직접 published 로 저장하는 경로는 없음
 *   - 모든 수집 활동은 bot_logs 테이블에 기록
 *   - news_sources_pg 테이블에서 활성 소스 조회
 *
 * 사용법:
 *   PG_DATABASE_URL=postgresql://... node collector/collect-pg.js
 */
import 'dotenv/config';
import Parser from 'rss-parser';
import crypto from 'crypto';
import pool from '../config/pg-client.js';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'TajWorldNewsBot/1.0' },
});

const MAX_PER_SOURCE = parseInt(process.env.MAX_ARTICLES_PER_SOURCE || '10');

// ── 활성 소스 조회 (news_sources_pg 테이블) ───────────────────
async function getActiveSources() {
  const { rows } = await pool.query(
    'SELECT * FROM news_sources_pg WHERE is_active = true ORDER BY priority ASC'
  );
  return rows;
}

// ── bot_logs 기록 ─────────────────────────────────────────────
async function logBotAction(action, sourceName, collected, skipped, error) {
  try {
    await pool.query(
      `INSERT INTO bot_logs (id, action, source_name, articles_collected, articles_skipped, error, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())`,
      [action, sourceName, collected, skipped, error]
    );
  } catch (e) {
    console.error('[bot_logs 기록 실패]', e.message);
  }
}

// ── slug 생성 ─────────────────────────────────────────────────
function slugify(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .slice(0, 200) +
    '-' +
    crypto.randomUUID().slice(0, 8)
  );
}

// ── 소스별 수집 ───────────────────────────────────────────────
async function collectFromSource(source) {
  console.log(`[수집] ${source.name} (${source.rss_url})`);

  let feed;
  try {
    feed = await parser.parseURL(source.rss_url);
  } catch (err) {
    console.error(`[실패] ${source.name}: ${err.message}`);
    await logBotAction('collect_error', source.name, 0, 0, err.message);
    return { collected: 0, skipped: 0 };
  }

  const items = (feed.items || []).slice(0, MAX_PER_SOURCE);
  let collected = 0;
  let skipped = 0;

  for (const item of items) {
    const link = item.link || item.guid;
    if (!link) continue;

    // 중복 체크 (original_link 기준)
    const { rows: existing } = await pool.query(
      'SELECT id FROM news_articles WHERE original_link = $1 LIMIT 1',
      [link]
    );
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const title = (item.title || '').trim();
    if (!title) continue;

    const slug = slugify(title);
    const body = item.contentSnippet || item.content || item.summary || '';
    const summary = body.slice(0, 300);
    const meta = JSON.stringify({
      categories: item.categories || [],
      feedTitle: feed.title || source.name,
      author: item.creator || item.author || null,
      pubDate: item.pubDate || null,
    });

    try {
      // ★ 핵심: status='draft' — 봇은 절대 published로 저장하지 않음
      await pool.query(
        `INSERT INTO news_articles
           (id, source_id, title, slug, body, summary, locale, status, original_link, meta, created_at, updated_at)
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, 'ko', 'draft', $6, $7, now(), now())`,
        [source.id, title, slug, body, summary, link, meta]
      );
      collected++;
    } catch (err) {
      console.error(`[저장실패] ${title}: ${err.message}`);
    }
  }

  // last_fetched_at 갱신
  await pool.query(
    'UPDATE news_sources_pg SET last_fetched_at = now(), updated_at = now() WHERE id = $1',
    [source.id]
  );

  await logBotAction('collect', source.name, collected, skipped, null);
  console.log(`[완료] ${source.name}: 수집 ${collected}, 스킵 ${skipped}`);
  return { collected, skipped };
}

// ── 메인 ──────────────────────────────────────────────────────
async function main() {
  console.log('=== 뉴스 수집 시작 (PostgreSQL) ===');
  console.log(`시각: ${new Date().toISOString()}`);

  const sources = await getActiveSources();
  console.log(`활성 소스: ${sources.length}개`);

  if (sources.length === 0) {
    console.log('[경고] news_sources_pg 테이블에 활성 소스가 없습니다.');
    console.log('       Admin CMS에서 뉴스 소스를 먼저 등록하세요.');
    await logBotAction('collect_skip', null, 0, 0, 'no active sources');
    await pool.end();
    return;
  }

  let totalCollected = 0;
  let totalSkipped = 0;

  for (const source of sources) {
    const result = await collectFromSource(source);
    totalCollected += result.collected;
    totalSkipped += result.skipped;
  }

  console.log(`\n=== 수집 완료: 수집 ${totalCollected}, 스킵 ${totalSkipped} ===`);
  await logBotAction('collect_complete', null, totalCollected, totalSkipped, null);
  await pool.end();
}

main().catch(async (err) => {
  console.error('수집 실패:', err);
  await logBotAction('collect_fatal', null, 0, 0, err.message).catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
